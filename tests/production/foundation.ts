// Run only against a local production server with REQUIRE_ADMIN_MFA=true.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, pool } from "../../src/lib/db";
import {
  users,
  sessions,
  audits,
  mfaCredentials,
  institutions,
  memberships,
} from "../../src/lib/schema";
import { hashPassword, digest } from "../../src/lib/auth";
import { totpFor } from "../../src/lib/mfa-crypto";
const base = process.env.PRODUCTION_TEST_URL ?? "http://127.0.0.1:3100";
if (!["127.0.0.1", "localhost"].includes(new URL(base).hostname))
  throw new Error(
    "Production verification must run locally with synthetic data",
  );
const origin =
  process.env.PRODUCTION_TEST_ORIGIN ?? "https://nexo-test.example";
const id = randomUUID(),
  email = id + "@production-test.example",
  password = randomUUID();
let schoolId: string | undefined;
async function api(route: string, method = "GET", body?: unknown, cookie = "") {
  return fetch(base + "/api/" + route, {
    method,
    redirect: "manual",
    headers: { origin, "Content-Type": "application/json", cookie },
    body: body ? JSON.stringify(body) : undefined,
  });
}
try {
  await db.insert(users).values({
    id,
    email,
    name: "Admin produção sintético",
    passwordHash: await hashPassword(password),
    platformAdmin: true,
  });
  assert.equal((await api("health")).status, 200);
  const signIn = await api("auth/login", "POST", { email, password });
  assert.equal(signIn.status, 200);
  assert.equal((await signIn.json()).needsMfaSetup, true);
  const header = signIn.headers.get("set-cookie")!;
  assert.match(header, /HttpOnly/);
  assert.match(header, /Secure/);
  const cookie = header.split(";")[0];
  assert.equal(
    (await api("institutions", "GET", undefined, cookie)).status,
    403,
  );
  assert.equal((await api("central", "GET", undefined, cookie)).status, 403);
  assert.equal(
    (
      await api(
        "auth/invitations/accept",
        "POST",
        { token: "0".repeat(64), name: "Inválido" },
        cookie,
      )
    ).status,
    403,
  );
  const status = await api("auth/security", "GET", undefined, cookie);
  assert.equal(status.status, 200);
  assert.equal((await status.json()).required, true);
  const setup = await api("auth/mfa/setup", "POST", { password }, cookie);
  assert.equal(setup.status, 200);
  const material = await setup.json();
  const confirmation = await api(
    "auth/mfa/confirm",
    "POST",
    { code: totpFor(material.manualKey).generate() },
    cookie,
  );
  assert.equal(confirmation.status, 200);
  const recovery = (await confirmation.json()).recoveryCodes;
  assert.equal((await api("central", "GET", undefined, cookie)).status, 200);
  const school = await api(
    "institutions",
    "POST",
    { name: "Escola produção sintética", timezone: "America/Manaus" },
    cookie,
  );
  assert.equal(school.status, 201);
  schoolId = (await school.json()).id;
  assert.equal(
    (
      await api(
        "auth/mfa/disable",
        "POST",
        { password, code: recovery[0] },
        cookie,
      )
    ).status,
    403,
  );
  assert.equal((await api("auth/logout", "POST", {}, cookie)).status, 200);
  const challenge = await api("auth/login", "POST", { email, password });
  assert.equal(challenge.status, 401);
  assert.equal((await challenge.json()).mfaRequired, true);
  assert.equal(challenge.headers.has("set-cookie"), false);
  const second = await api("auth/login", "POST", {
    email,
    password,
    code: recovery[0],
  });
  assert.equal(second.status, 200);
  const replay = await api("auth/login", "POST", {
    email,
    password,
    code: recovery[0],
  });
  assert.equal(replay.status, 401);
  console.log(
    "Production HTTP foundation passed: restricted enrollment, encrypted MFA confirmation, Secure session, operational unlock, required MFA, recovery code and replay protection.",
  );
} finally {
  if (schoolId) {
    await db.delete(audits).where(eq(audits.institutionId, schoolId));
    await db.delete(memberships).where(eq(memberships.institutionId, schoolId));
    await db.delete(institutions).where(eq(institutions.id, schoolId));
  }
  await db.delete(audits).where(eq(audits.actorId, id));
  await db.delete(sessions).where(eq(sessions.userId, id));
  await db.delete(mfaCredentials).where(eq(mfaCredentials.userId, id));
  await db.delete(users).where(eq(users.id, id));
  await pool.query("DELETE FROM login_attempts WHERE key_hash=ANY($1)", [
    [digest(email), digest("mfa:" + id)],
  ]);
  await pool.end();
}
