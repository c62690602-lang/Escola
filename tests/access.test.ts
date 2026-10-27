import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readdir, readFile, unlink } from "node:fs/promises";
import { eq, inArray } from "drizzle-orm";
import { db, pool } from "../src/lib/db";
import {
  users,
  institutions,
  memberships,
  accountTokens,
  audits,
  sessions,
} from "../src/lib/schema";
import { hashPassword, login, sessionUser, digest } from "../src/lib/auth";
import { createInstitution, overview, AccessError } from "../src/lib/service";
import {
  invite,
  acceptInvitation,
  listAccess,
  revokeInvitation,
  changeMembership,
  requestRecovery,
  resetPassword,
  DeliveryUnavailable,
} from "../src/lib/access";
const userIds: string[] = [],
  schoolIds: string[] = [],
  emails: string[] = [],
  mailFiles: string[] = [];
after(async () => {
  for (const id of schoolIds) {
    await db.delete(accountTokens).where(eq(accountTokens.institutionId, id));
    await db.delete(audits).where(eq(audits.institutionId, id));
    await db.delete(memberships).where(eq(memberships.institutionId, id));
    await db.delete(institutions).where(eq(institutions.id, id));
  }
  if (emails.length) {
    await db.delete(accountTokens).where(inArray(accountTokens.email, emails));
    await pool.query("DELETE FROM login_attempts WHERE key_hash=ANY($1)", [
      emails.flatMap((e) => [digest(e), digest("recovery:" + e)]),
    ]);
  }
  if (userIds.length) {
    await db.delete(audits).where(inArray(audits.actorId, userIds));
    await db.delete(sessions).where(inArray(sessions.userId, userIds));
    await db.delete(users).where(inArray(users.id, userIds));
  }
  for (const file of mailFiles) await unlink(file).catch(() => {});
  await pool.end();
});
async function actor(admin = false) {
  const id = randomUUID(),
    email = id + "@access.example";
  userIds.push(id);
  emails.push(email);
  const a = { id, email, name: "Pessoa sintética", platformAdmin: admin };
  await db.insert(users).values({
    ...a,
    passwordHash: await hashPassword("initial-test-password"),
  });
  return a;
}
async function setup() {
  const admin = await actor(true);
  const id = await createInstitution(admin, {
    name: "Escola teste de acessos",
  });
  schoolIds.push(id);
  return { admin, id };
}
async function newEmail() {
  const email = randomUUID() + "@invite.example";
  emails.push(email);
  return email;
}
async function rememberUser(email: string) {
  const [u] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email));
  if (u && !userIds.includes(u.id)) userIds.push(u.id);
  return u;
}
test("convite persiste somente hash, cria conta sem admin e vínculo, uso único", async () => {
  const { admin, id } = await setup();
  const email = await newEmail();
  const result = await invite(admin, id, { email, role: "diretor" });
  const [row] = await db
    .select()
    .from(accountTokens)
    .where(eq(accountTokens.id, result.id));
  assert.equal(row.tokenHash, digest(result.token));
  assert.notEqual(row.tokenHash, result.token);
  await acceptInvitation(
    {
      token: result.token,
      name: "Direção teste",
      password: "new-account-password",
    },
    null,
  );
  const user = await rememberUser(email);
  assert.ok(user);
  const token = await login(email, "new-account-password");
  assert.ok(token);
  const authenticated = await sessionUser(token);
  assert.equal(authenticated?.platformAdmin, false);
  assert.equal((await overview(authenticated!, id)).canManage, false);
  await assert.rejects(
    () =>
      acceptInvitation(
        { token: result.token, name: "Outra", password: "other-password-long" },
        null,
      ),
    /já utilizado/,
  );
  const list = await listAccess(admin, id);
  assert.equal(list.members[0].id, user.id);
  assert.equal(JSON.stringify(list).includes(result.token), false);
  assert.ok(list.invitations[0].usedAt);
});
test("diretor não lista acessos, não convida nem atribui papel", async () => {
  const { admin, id } = await setup();
  const director = await actor();
  await db
    .insert(memberships)
    .values({ userId: director.id, institutionId: id, role: "diretor" });
  await assert.rejects(() => listAccess(director, id), AccessError);
  await assert.rejects(
    async () =>
      invite(director, id, { email: await newEmail(), role: "gestor" }),
    AccessError,
  );
  await assert.rejects(
    () => changeMembership(director, id, director.id, { role: "gestor" }),
    AccessError,
  );
  await assert.rejects(() =>
    invite(admin, id, { email: "a@example.com", role: "superadmin" }),
  );
});
test("convite revogado, expirado e substituído não concede acesso", async () => {
  const { admin, id } = await setup();
  const email = await newEmail();
  const old = await invite(admin, id, { email, role: "gestor" });
  const current = await invite(admin, id, { email, role: "diretor" });
  await assert.rejects(
    () =>
      acceptInvitation(
        { token: old.token, name: "Teste", password: "a-strong-password" },
        null,
      ),
    /inválido/,
  );
  await revokeInvitation(admin, id, current.id);
  await assert.rejects(
    () =>
      acceptInvitation(
        { token: current.token, name: "Teste", password: "a-strong-password" },
        null,
      ),
    /inválido/,
  );
  const expired = await invite(admin, id, { email, role: "diretor" });
  await db
    .update(accountTokens)
    .set({ expiresAt: new Date(0) })
    .where(eq(accountTokens.id, expired.id));
  await assert.rejects(
    () =>
      acceptInvitation(
        { token: expired.token, name: "Teste", password: "a-strong-password" },
        null,
      ),
    /expirado/,
  );
});
test("convite para conta existente exige sessão da própria pessoa e não altera senha", async () => {
  const { admin, id } = await setup();
  const existing = await actor();
  const result = await invite(admin, id, {
    email: existing.email,
    role: "gestor",
  });
  await assert.rejects(
    () =>
      acceptInvitation(
        {
          token: result.token,
          name: "Teste",
          password: "attacker-password-new",
        },
        null,
      ),
    AccessError,
  );
  await assert.rejects(
    () => acceptInvitation({ token: result.token, name: "Teste" }, admin),
    AccessError,
  );
  await acceptInvitation(
    { token: result.token, name: "Teste", password: "ignored-new-password" },
    existing,
  );
  assert.ok(await login(existing.email, "initial-test-password"));
  assert.equal(await login(existing.email, "ignored-new-password"), null);
  assert.equal((await overview(existing, id)).canManage, true);
});
test("mudança de papel revoga sessões; revogação do vínculo impede acesso imediatamente", async () => {
  const { admin, id } = await setup();
  const member = await actor();
  await db
    .insert(memberships)
    .values({ userId: member.id, institutionId: id, role: "gestor" });
  const token = await login(member.email, "initial-test-password");
  assert.ok(token);
  await changeMembership(admin, id, member.id, { role: "diretor" });
  assert.equal(await sessionUser(token), null);
  assert.equal((await overview(member, id)).canManage, false);
  await changeMembership(admin, id, member.id, { revoke: true });
  await assert.rejects(() => overview(member, id), AccessError);
});
test("ID de usuário ou convite de outra instituição não pode ser alterado", async () => {
  const { admin, id } = await setup();
  const second = await createInstitution(admin, { name: "Outra escola teste" });
  schoolIds.push(second);
  const member = await actor();
  await db
    .insert(memberships)
    .values({ userId: member.id, institutionId: second, role: "diretor" });
  await assert.rejects(
    () => changeMembership(admin, id, member.id, { role: "gestor" }),
    AccessError,
  );
  const result = await invite(admin, second, {
    email: await newEmail(),
    role: "diretor",
  });
  await assert.rejects(
    () => revokeInvitation(admin, id, result.id),
    /indisponível/,
  );
  assert.equal(
    (await listAccess(admin, second)).invitations[0].revokedAt,
    null,
  );
});
test("aceitação concorrente concede vínculo uma única vez", async () => {
  const { admin, id } = await setup();
  const email = await newEmail();
  const result = await invite(admin, id, { email, role: "diretor" });
  const attempts = await Promise.allSettled(
    [1, 2].map(() =>
      acceptInvitation(
        {
          token: result.token,
          name: "Pessoa teste",
          password: "concurrent-password",
        },
        null,
      ),
    ),
  );
  await rememberUser(email);
  assert.equal(attempts.filter((a) => a.status === "fulfilled").length, 1);
  assert.equal((await listAccess(admin, id)).members.length, 1);
});
test("recuperação local troca senha, invalida sessões e token; conta ausente não cria entrega", async () => {
  const user = await actor();
  const oldSession = await login(user.email, "initial-test-password");
  assert.ok(oldSession);
  const directory = ".local/mail";
  await requestRecovery({ email: user.email });
  let message: { path: string; to: string } | undefined;
  for (const name of await readdir(directory)) {
    const file = directory + "/" + name;
    const candidate = JSON.parse(await readFile(file, "utf8"));
    if (candidate.to === user.email) {
      message = candidate;
      mailFiles.push(file);
    }
  }
  assert.ok(message);
  const token = new URLSearchParams(message.path.split("#")[1]).get("token")!;
  assert.equal(token.length, 64);
  await resetPassword({ token, password: "recovered-strong-password" });
  assert.equal(await sessionUser(oldSession), null);
  assert.equal(await login(user.email, "initial-test-password"), null);
  assert.ok(await login(user.email, "recovered-strong-password"));
  await assert.rejects(
    () => resetPassword({ token, password: "another-strong-password" }),
    /já utilizado/,
  );
  const absent = await newEmail();
  await requestRecovery({ email: absent });
  assert.equal(
    (
      await db
        .select()
        .from(accountTokens)
        .where(eq(accountTokens.email, absent))
    ).length,
    0,
  );
});
test("recuperação nega token expirado e senha curta", async () => {
  const user = await actor();
  const token = randomUUID().replaceAll("-", "").repeat(2);
  await db.insert(accountTokens).values({
    id: randomUUID(),
    tokenHash: digest(token),
    kind: "recovery",
    email: user.email,
    expiresAt: new Date(0),
  });
  await assert.rejects(
    () => resetPassword({ token, password: "strong-enough-password" }),
    /expirado/,
  );
  await assert.rejects(() => resetPassword({ token, password: "short" }));
});
test("recuperação não simula envio fora do modo de demonstração", async () => {
  const before = process.env.DEMO_MODE;
  try {
    process.env.DEMO_MODE = "false";
    await assert.rejects(
      () => requestRecovery({ email: "none@example.com" }),
      DeliveryUnavailable,
    );
  } finally {
    process.env.DEMO_MODE = before;
  }
});
test("demonstração pública nunca grava recuperação em caixa local", async () => {
  const previous = process.env.PUBLIC_DEMO;
  try {
    process.env.PUBLIC_DEMO = "true";
    await assert.rejects(
      () => requestRecovery({ email: "synthetic@example.com" }),
      DeliveryUnavailable,
    );
  } finally {
    if (previous === undefined) delete process.env.PUBLIC_DEMO;
    else process.env.PUBLIC_DEMO = previous;
  }
});
