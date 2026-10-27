import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { db, pool } from "../src/lib/db";
import {
  users,
  institutions,
  memberships,
  tasks,
  projects,
  audits,
  units,
  sessions,
} from "../src/lib/schema";
import {
  hashPassword,
  checkPassword,
  login,
  sessionUser,
  digest,
  type Actor,
} from "../src/lib/auth";
import * as service from "../src/lib/service";
const ids: string[] = [];
const userIds: string[] = [];
after(async () => {
  for (const id of ids) {
    await db.delete(audits).where(eq(audits.institutionId, id));
    await db.delete(tasks).where(eq(tasks.institutionId, id));
    await db.delete(projects).where(eq(projects.institutionId, id));
    await db.delete(units).where(eq(units.institutionId, id));
    await db.delete(memberships).where(eq(memberships.institutionId, id));
    await db.delete(institutions).where(eq(institutions.id, id));
  }
  if (userIds.length) {
    await db.delete(sessions).where(inArray(sessions.userId, userIds));
    await db.delete(users).where(inArray(users.id, userIds));
  }
  await pool.end();
});
async function actor(admin = false): Promise<Actor> {
  const id = randomUUID();
  userIds.push(id);
  const a = {
    id,
    name: "Teste sintético",
    email: `${id}@test.example`,
    platformAdmin: admin,
  };
  await db.insert(users).values({
    ...a,
    passwordHash: await hashPassword("test-only-password-123"),
  });
  return a;
}
async function school(a: Actor) {
  const id = await service.createInstitution(a, {
    name: "Instituição sintética",
    city: "Teste",
    state: "SP",
  });
  ids.push(id);
  return id;
}
test("senhas usam salt e rejeitam senha incorreta", async () => {
  const hash = await hashPassword("senha-teste");
  assert.notEqual(hash, await hashPassword("senha-teste"));
  assert.equal(await checkPassword("senha-teste", hash), true);
  assert.equal(await checkPassword("outra", hash), false);
});
test("instituição nova tem dados vazios e implantação não iniciada", async () => {
  const a = await actor(true);
  const id = await school(a);
  const data = await service.overview(a, id);
  assert.equal(data.progress, null);
  assert.equal(data.tasks.length, 0);
  assert.equal(data.project, null);
  assert.equal(data.history[0].action, "institution.created");
});
test("implantação gera 12 etapas, é atômica e não conclui pelo prazo", async () => {
  const a = await actor(true);
  const id = await school(a);
  await service.startOnboarding(a, id, { startsOn: "2020-01-01" });
  let data = await service.overview(a, id);
  assert.equal(data.tasks.length, 12);
  assert.equal(data.progress, 0);
  await assert.rejects(
    () => service.updateTask(a, id, data.tasks[0].id, { archive: true }),
    /não podem ser arquivadas/,
  );
  assert.equal((await service.overview(a, id)).tasks.length, 12);
  assert.equal(data.project?.endsOn, "2020-03-01");
  await assert.rejects(
    () => service.startOnboarding(a, id, { startsOn: "2020-01-01" }),
    /já iniciada/,
  );
  assert.equal((await service.overview(a, id)).tasks.length, 12);
  await assert.rejects(
    () => service.updateTask(a, id, data.tasks[0].id, { status: "concluida" }),
    /verificação/,
  );
  await service.updateTask(a, id, data.tasks[0].id, {
    status: "concluida",
    completionNote: "Validação sintética realizada",
  });
  data = await service.overview(a, id);
  assert.equal(data.progress, 8);
  assert.ok(data.history.find((h) => h.action === "task.concluida"));
});
test("escola A não acessa dados da escola B nem altera tarefas por id", async () => {
  const admin = await actor(true);
  const director = await actor();
  const a = await school(admin);
  const b = await school(admin);
  await db
    .insert(memberships)
    .values({ userId: director.id, institutionId: a, role: "diretor" });
  assert.equal((await service.portfolio(director)).length, 1);
  await assert.rejects(
    () => service.overview(director, b),
    service.AccessError,
  );
  await assert.rejects(
    () => service.createInstitution(director, { name: "Inválida" }),
    service.AccessError,
  );
  await assert.rejects(
    () => service.createTask(director, a, {}),
    service.AccessError,
  );
  const taskId = await service.createTask(admin, b, {
    title: "Tarefa escola B",
    priority: "alta",
    dueOn: "2026-12-01",
  });
  await assert.rejects(
    () => service.updateTask(admin, a, taskId, { status: "em_andamento" }),
    service.AccessError,
  );
  assert.equal((await service.overview(admin, b)).tasks[0].status, "pendente");
});
test("gestor atribuído pode operar, diretor e superadmin não acessam acolhimento", async () => {
  const admin = await actor(true);
  const manager = await actor();
  const id = await school(admin);
  await db
    .insert(memberships)
    .values({ userId: manager.id, institutionId: id, role: "gestor" });
  const taskId = await service.createTask(manager, id, {
    title: "Tarefa real persistida",
    priority: "media",
    dueOn: "2026-12-01",
  });
  assert.equal((await service.overview(manager, id)).tasks[0].id, taskId);
  await assert.rejects(() => service.confidentialAccess(), service.AccessError);
  await service.updateTask(manager, id, taskId, { archive: true });
  assert.equal((await service.overview(manager, id)).tasks.length, 0);
  assert.equal(
    (await db.select().from(tasks).where(eq(tasks.id, taskId))).length,
    1,
  );
});
test("validação rejeita datas e textos inválidos antes da persistência", async () => {
  const a = await actor(true);
  const id = await school(a);
  await assert.rejects(() =>
    service.createTask(a, id, {
      title: "x",
      dueOn: "2026-02-31",
      priority: "extrema",
    }),
  );
  assert.equal((await service.overview(a, id)).tasks.length, 0);
});
test("sessão expira e logout invalida token no banco", async () => {
  const a = await actor();
  assert.equal(await login(a.email, "incorreta"), null);
  const token = await login(a.email, "test-only-password-123");
  assert.ok(token);
  assert.equal((await sessionUser(token))?.id, a.id);
  await db
    .update(sessions)
    .set({ expiresAt: new Date(0) })
    .where(eq(sessions.tokenHash, digest(token)));
  assert.equal(await sessionUser(token), null);
  const token2 = await login(a.email, "test-only-password-123");
  assert.ok(token2);
  await db.delete(sessions).where(eq(sessions.tokenHash, digest(token2)));
  assert.equal(await sessionUser(token2), null);
  await pool.query("DELETE FROM login_attempts WHERE key_hash=$1", [
    digest(a.email),
  ]);
});
