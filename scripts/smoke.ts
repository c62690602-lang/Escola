import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, pool } from "../src/lib/db";
import {
  users,
  institutions,
  memberships,
  tasks,
  projects,
  audits,
  sessions,
} from "../src/lib/schema";
import { hashPassword, digest } from "../src/lib/auth";
const base = process.env.SMOKE_URL ?? "http://127.0.0.1:3000";
const origin = process.env.SMOKE_ORIGIN ?? base;
const password = randomUUID();
const adminId = randomUUID(),
  directorId = randomUUID();
const schoolIds: string[] = [];
const adminEmail = `${adminId}@test.example`,
  directorEmail = `${directorId}@test.example`;
async function api(path: string, method = "GET", body?: unknown, cookie = "") {
  return fetch(`${base}/api/${path}`, {
    method,
    headers: { origin, "Content-Type": "application/json", cookie },
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });
}
try {
  await db.insert(users).values([
    {
      id: adminId,
      name: "Smoke admin",
      email: adminEmail,
      passwordHash: await hashPassword(password),
      platformAdmin: true,
    },
    {
      id: directorId,
      name: "Smoke direção",
      email: directorEmail,
      passwordHash: await hashPassword(password),
      platformAdmin: false,
    },
  ]);
  assert.equal((await api("institutions")).status, 401);
  const login = await api("auth/login", "POST", {
    email: adminEmail,
    password,
  });
  assert.equal(login.status, 200);
  const cookie = login.headers.get("set-cookie")!.split(";")[0];
  assert.ok(login.headers.get("set-cookie")!.includes("HttpOnly"));
  for (let i = 0; i < 2; i++) {
    const res = await api(
      "institutions",
      "POST",
      { name: `Escola smoke ${i}` },
      cookie,
    );
    assert.equal(res.status, 201);
    schoolIds.push((await res.json()).id);
  }
  const [a, b] = schoolIds;
  await db
    .insert(memberships)
    .values({ userId: directorId, institutionId: a, role: "diretor" });
  assert.equal(
    (await api(`institutions/${a}`, "GET", undefined, cookie)).status,
    200,
  );
  assert.equal(
    (
      await api(
        `institutions/${a}/onboarding`,
        "POST",
        { startsOn: "2026-10-01" },
        cookie,
      )
    ).status,
    201,
  );
  let report = await (
    await api(`institutions/${a}/report`, "GET", undefined, cookie)
  ).json();
  assert.equal(report.progress, 0);
  assert.equal(report.tasks.length, 12);
  assert.equal(
    (
      await api(
        `institutions/${a}/tasks/${report.tasks[0].id}`,
        "PATCH",
        { status: "concluida", completionNote: "Etapa validada no teste HTTP" },
        cookie,
      )
    ).status,
    200,
  );
  report = await (
    await api(`institutions/${a}/report`, "GET", undefined, cookie)
  ).json();
  assert.equal(report.progress, 8);
  assert.equal(report.version, 1);
  const directorLogin = await api("auth/login", "POST", {
    email: directorEmail,
    password,
  });
  const dc = directorLogin.headers.get("set-cookie")!.split(";")[0];
  assert.equal(
    (await api(`institutions/${b}`, "GET", undefined, dc)).status,
    403,
  );
  assert.equal(
    (await api(`institutions/${a}/care`, "GET", undefined, dc)).status,
    403,
  );
  assert.equal(
    (
      await api(
        `institutions/${a}/tasks`,
        "POST",
        { title: "Não permitida", priority: "alta", dueOn: "2026-12-01" },
        dc,
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await fetch(`${base}/api/institutions`, {
        method: "POST",
        headers: {
          cookie,
          origin: "https://hostile.example",
          "Content-Type": "application/json",
        },
        body: '{"name":"Blocked"}',
      })
    ).status,
    403,
  );
  assert.equal((await api("auth/logout", "POST", {}, cookie)).status, 200);
  assert.equal(
    (await api("institutions", "GET", undefined, cookie)).status,
    401,
  );
  console.log(
    "HTTP smoke: authentication, persistence, onboarding, report, tenant isolation, permissions, CSRF and logout passed.",
  );
} finally {
  for (const id of schoolIds) {
    for (const table of [audits, tasks, projects, memberships])
      await db.delete(table).where(eq(table.institutionId, id));
    await db.delete(institutions).where(eq(institutions.id, id));
  }
  for (const id of [adminId, directorId]) {
    await db.delete(sessions).where(eq(sessions.userId, id));
    await db.delete(users).where(eq(users.id, id));
  }
  await pool.query("DELETE FROM login_attempts WHERE key_hash=ANY($1)", [
    [digest(adminEmail), digest(directorEmail)],
  ]);
  await pool.end();
}
