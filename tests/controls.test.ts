import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { db, pool } from "../src/lib/db";
import {
  users,
  institutions,
  memberships,
  audits,
  units,
  tasks,
  projects,
} from "../src/lib/schema";
import { hashPassword, type Actor } from "../src/lib/auth";
import {
  createInstitution,
  createTask,
  createUnit,
  startOnboarding,
  overview,
  authorize,
  commandCenter,
  AccessError,
} from "../src/lib/service";
import { changeMembership } from "../src/lib/access";
const userIds: string[] = [],
  schoolIds: string[] = [];
after(async () => {
  for (const id of schoolIds) {
    for (const table of [audits, tasks, units, projects, memberships])
      await db.delete(table).where(eq(table.institutionId, id));
    await db.delete(institutions).where(eq(institutions.id, id));
  }
  await db.delete(users).where(inArray(users.id, userIds));
  await pool.end();
});
async function setup() {
  const admin: Actor = {
    id: randomUUID(),
    name: "Admin sintético",
    email: randomUUID() + "@controls.example",
    platformAdmin: true,
  };
  const member: Actor = {
    id: randomUUID(),
    name: "Membro sintético",
    email: randomUUID() + "@controls.example",
    platformAdmin: false,
  };
  for (const a of [admin, member]) {
    userIds.push(a.id);
    await db
      .insert(users)
      .values({
        ...a,
        passwordHash: await hashPassword("controls-test-password"),
      });
  }
  const id = await createInstitution(admin, {
    name: "Escola de controles sintética",
  });
  schoolIds.push(id);
  await db
    .insert(memberships)
    .values({ userId: member.id, institutionId: id, role: "gestor" });
  return { admin, member, id };
}
test("permissões explícitas vazias retiram escrita do gestor e escondem auditoria", async () => {
  const { admin, member, id } = await setup();
  await changeMembership(admin, id, member.id, { permissions: [] });
  const data = await overview(member, id);
  assert.equal(data.canManage, false);
  assert.deepEqual(data.capabilities, []);
  assert.deepEqual(data.history, []);
  await assert.rejects(
    () =>
      createTask(member, id, {
        title: "Negada",
        priority: "media",
        dueOn: "2026-12-01",
      }),
    AccessError,
  );
  await assert.rejects(
    () => authorize(member, id, "reports.read"),
    AccessError,
  );
});
test("permissão de unidades não concede tarefas nem outra instituição", async () => {
  const { admin, member, id } = await setup();
  await changeMembership(admin, id, member.id, {
    permissions: ["units.write"],
  });
  await createUnit(member, id, { name: "Unidade sintética" });
  assert.equal((await overview(member, id)).units.length, 1);
  await assert.rejects(
    () => startOnboarding(member, id, { startsOn: "2026-10-01" }),
    AccessError,
  );
  const second = await createInstitution(admin, { name: "Escola B" });
  schoolIds.push(second);
  await assert.rejects(
    () => createUnit(member, second, { name: "Indevida" }),
    AccessError,
  );
});
test("restaurar padrão e mudar papel atualiza permissões; chaves desconhecidas são negadas", async () => {
  const { admin, member, id } = await setup();
  await changeMembership(admin, id, member.id, { permissions: [] });
  await changeMembership(admin, id, member.id, { permissions: null });
  assert.equal((await overview(member, id)).canManage, true);
  await changeMembership(admin, id, member.id, {
    permissions: ["tasks.write"],
  });
  await changeMembership(admin, id, member.id, { role: "diretor" });
  assert.equal((await overview(member, id)).canManage, false);
  await assert.rejects(() =>
    changeMembership(admin, id, member.id, { permissions: ["platform.admin"] }),
  );
});
test("painel central usa registros reais e não simula módulos ausentes", async () => {
  const { admin, member, id } = await setup();
  await createUnit(admin, id, { name: "Unidade real de teste" });
  await createTask(admin, id, {
    title: "Pendência antiga sintética",
    priority: "alta",
    dueOn: "2020-01-01",
  });
  await startOnboarding(admin, id, { startsOn: "2020-01-01" });
  const data = await commandCenter(admin);
  const row = data.institutions.find((s) => s.id === id)!;
  assert.equal(row.units, 1);
  assert.equal(row.open_tasks, 13);
  assert.equal(row.overdue_tasks, 13);
  assert.equal(row.high_priority, 1);
  assert.equal(row.progress, 0);
  assert.ok(data.unavailableIndicators.includes("Receita recorrente"));
  await assert.rejects(() => commandCenter(member), AccessError);
});
test("fuso IANA é validado e armazenado na instituição", async () => {
  const { admin, id } = await setup();
  assert.equal(
    (await overview(admin, id)).institution.timezone,
    "America/Sao_Paulo",
  );
  await assert.rejects(() =>
    createInstitution(admin, {
      name: "Fuso inválido",
      timezone: "invalid/timezone",
    }),
  );
});
test("sessão restrita ao cadastro de MFA não acessa domínio operacional", async () => {
  const { admin, id } = await setup();
  const restricted = { ...admin, needsMfaSetup: true };
  await assert.rejects(() => overview(restricted, id), AccessError);
  await assert.rejects(
    () => createInstitution(restricted, { name: "Negada" }),
    AccessError,
  );
  await assert.rejects(() => commandCenter(restricted), AccessError);
});
