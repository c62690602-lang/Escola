import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { Secret } from "otpauth";
import { eq, inArray } from "drizzle-orm";
import { db, pool } from "../src/lib/db";
import {
  users,
  sessions,
  audits,
  mfaCredentials,
  accountTokens,
} from "../src/lib/schema";
import {
  hashPassword,
  login,
  sessionUser,
  digest,
  type Actor,
} from "../src/lib/auth";
import {
  beginMfaSetup,
  confirmMfaSetup,
  disableMfa,
  mfaStatus,
} from "../src/lib/mfa";
import {
  encryptMfaSecret,
  decryptMfaSecret,
  matchingCounter,
  totpFor,
  MfaRequiredError,
  MfaInvalidError,
  MfaConfigurationError,
} from "../src/lib/mfa-crypto";
import { AccessError, commandCenter } from "../src/lib/service";
import { resetPassword } from "../src/lib/access";
const ids: string[] = [],
  emails: string[] = [];
after(async () => {
  await db.delete(accountTokens).where(inArray(accountTokens.email, emails));
  await db.delete(audits).where(inArray(audits.actorId, ids));
  await db.delete(sessions).where(inArray(sessions.userId, ids));
  await db.delete(mfaCredentials).where(inArray(mfaCredentials.userId, ids));
  await db.delete(users).where(inArray(users.id, ids));
  await pool.query("DELETE FROM login_attempts WHERE key_hash=ANY($1)", [
    [...ids.map((id) => digest("mfa:" + id)), ...emails.map(digest)],
  ]);
  await pool.end();
});
async function person(admin = false) {
  const actor: Actor = {
    id: randomUUID(),
    name: "Pessoa MFA sintética",
    email: randomUUID() + "@mfa.example",
    platformAdmin: admin,
  };
  ids.push(actor.id);
  emails.push(actor.email);
  await db
    .insert(users)
    .values({
      ...actor,
      passwordHash: await hashPassword("mfa-test-password-long"),
    });
  return actor;
}
async function enrolled(admin = false) {
  const actor = await person(admin);
  const session = await login(actor.email, "mfa-test-password-long");
  assert.ok(session);
  const setup = await beginMfaSetup(actor, {
    password: "mfa-test-password-long",
  });
  const code = totpFor(setup.manualKey).generate();
  const result = await confirmMfaSetup(actor, session, { code });
  return { actor, session, setup, code, result };
}
test("cifragem autenticada não aceita outra conta nem alteração do ciphertext", () => {
  const secret = new Secret({ size: 20 }).base32;
  const owner = randomUUID();
  const encrypted = encryptMfaSecret(secret, owner);
  assert.ok(encrypted !== secret);
  assert.ok(decryptMfaSecret(encrypted, owner) === secret);
  assert.throws(
    () => decryptMfaSecret(encrypted, randomUUID()),
    MfaConfigurationError,
  );
  const parts = encrypted.split(".");
  const data = Buffer.from(parts[3], "base64url");
  data[0] ^= 1;
  parts[3] = data.toString("base64url");
  assert.throws(
    () => decryptMfaSecret(parts.join("."), owner),
    MfaConfigurationError,
  );
});
test("TOTP aceita janela limitada e rejeita repetição e código expirado", () => {
  const secret = new Secret({ size: 20 }).base32;
  const timestamp = 1800000000000;
  const code = totpFor(secret).generate({ timestamp });
  const counter = matchingCounter(secret, code, -1, timestamp);
  assert.notEqual(counter, null);
  assert.equal(matchingCounter(secret, code, counter!, timestamp), null);
  assert.equal(matchingCounter(secret, code, -1, timestamp + 120000), null);
});
test("cadastro exige senha atual; confirmação cifrada ativa MFA e revoga outras sessões", async () => {
  const actor = await person();
  const first = await login(actor.email, "mfa-test-password-long");
  const other = await login(actor.email, "mfa-test-password-long");
  assert.ok(first && other);
  await assert.rejects(
    () => beginMfaSetup(actor, { password: "wrong-password" }),
    AccessError,
  );
  const setup = await beginMfaSetup(actor, {
    password: "mfa-test-password-long",
  });
  assert.match(setup.qrCodeDataUrl, /^data:image\/png;base64,/);
  const [pending] = await db
    .select()
    .from(mfaCredentials)
    .where(eq(mfaCredentials.userId, actor.id));
  assert.ok(pending.pendingEncrypted !== setup.manualKey);
  assert.equal((await mfaStatus(actor)).enabled, false);
  const result = await confirmMfaSetup(actor, first, {
    code: totpFor(setup.manualKey).generate(),
  });
  assert.equal(result.recoveryCodes.length, 10);
  assert.equal(await sessionUser(other), null);
  assert.equal((await sessionUser(first))?.mfaVerified, true);
  const [record] = await db
    .select()
    .from(mfaCredentials)
    .where(eq(mfaCredentials.userId, actor.id));
  assert.ok(record.secretEncrypted !== setup.manualKey);
  assert.ok(!record.recoveryHashes.includes(result.recoveryCodes[0]));
  assert.equal(record.pendingEncrypted, null);
});
test("login não cria sessão sem segundo fator nem aceita o código de confirmação repetido", async () => {
  const { actor, code, result } = await enrolled();
  const before = (
    await db.select().from(sessions).where(eq(sessions.userId, actor.id))
  ).length;
  await assert.rejects(
    () => login(actor.email, "mfa-test-password-long"),
    MfaRequiredError,
  );
  await assert.rejects(
    () => login(actor.email, "mfa-test-password-long", code),
    MfaInvalidError,
  );
  assert.equal(
    (await db.select().from(sessions).where(eq(sessions.userId, actor.id)))
      .length,
    before,
  );
  const token = await login(
    actor.email,
    "mfa-test-password-long",
    result.recoveryCodes[0],
  );
  assert.ok(token);
  assert.equal((await sessionUser(token))?.mfaVerified, true);
  await assert.rejects(
    () => login(actor.email, "mfa-test-password-long", result.recoveryCodes[0]),
    MfaInvalidError,
  );
});
test("código de recuperação concorrente funciona uma vez e nunca remove o MFA", async () => {
  const { actor, result } = await enrolled();
  const attempts = await Promise.allSettled(
    [1, 2].map(() =>
      login(actor.email, "mfa-test-password-long", result.recoveryCodes[0]),
    ),
  );
  assert.equal(
    attempts.filter((r) => r.status === "fulfilled" && r.value).length,
    1,
  );
  const status = await mfaStatus(actor);
  assert.equal(status.enabled, true);
  assert.equal(status.recoveryCodesRemaining, 9);
});
test("cadastro expirado e segundo fator incorreto não ativam MFA", async () => {
  const actor = await person();
  const session = await login(actor.email, "mfa-test-password-long");
  assert.ok(session);
  const setup = await beginMfaSetup(actor, {
    password: "mfa-test-password-long",
  });
  await db
    .update(mfaCredentials)
    .set({ pendingUntil: new Date(0) })
    .where(eq(mfaCredentials.userId, actor.id));
  await assert.rejects(
    () =>
      confirmMfaSetup(actor, session, {
        code: totpFor(setup.manualKey).generate(),
      }),
    /expirado/,
  );
  assert.equal((await mfaStatus(actor)).enabled, false);
});
test("obrigatoriedade administrativa cria sessão restrita até confirmar MFA", async () => {
  const previous = process.env.REQUIRE_ADMIN_MFA;
  try {
    process.env.REQUIRE_ADMIN_MFA = "true";
    const actor = await person(true);
    const token = await login(actor.email, "mfa-test-password-long");
    assert.ok(token);
    const restricted = (await sessionUser(token))!;
    assert.equal(restricted.needsMfaSetup, true);
    await assert.rejects(() => commandCenter(restricted), AccessError);
    const setup = await beginMfaSetup(restricted, {
      password: "mfa-test-password-long",
    });
    await confirmMfaSetup(restricted, token, {
      code: totpFor(setup.manualKey).generate(),
    });
    const full = (await sessionUser(token))!;
    assert.equal(full.needsMfaSetup, false);
    assert.equal(full.mfaVerified, true);
    await assert.rejects(
      () =>
        disableMfa(full, {
          password: "mfa-test-password-long",
          code: "000000",
        }),
      AccessError,
    );
  } finally {
    if (previous === undefined) delete process.env.REQUIRE_ADMIN_MFA;
    else process.env.REQUIRE_ADMIN_MFA = previous;
  }
});
test("recuperação de senha não desativa segundo fator", async () => {
  const { actor } = await enrolled();
  const raw = randomBytes(32).toString("hex");
  await db
    .insert(accountTokens)
    .values({
      id: randomUUID(),
      tokenHash: digest(raw),
      kind: "recovery",
      email: actor.email,
      expiresAt: new Date(Date.now() + 60000),
    });
  await resetPassword({ token: raw, password: "new-password-still-needs-mfa" });
  assert.equal((await mfaStatus(actor)).enabled, true);
  await assert.rejects(
    () => login(actor.email, "new-password-still-needs-mfa"),
    MfaRequiredError,
  );
});
test("desativação opcional exige fator e encerra todas as sessões", async () => {
  const { actor, session, result } = await enrolled();
  const full = (await sessionUser(session))!;
  await disableMfa(full, {
    password: "mfa-test-password-long",
    code: result.recoveryCodes[0],
  });
  assert.equal(await sessionUser(session), null);
  assert.equal((await mfaStatus(actor)).enabled, false);
  assert.ok(await login(actor.email, "mfa-test-password-long"));
});
test("sessão sem verificação de MFA é negada mesmo que exista no banco", async () => {
  const { actor } = await enrolled();
  const raw = randomBytes(32).toString("hex");
  await db
    .insert(sessions)
    .values({
      tokenHash: digest(raw),
      userId: actor.id,
      expiresAt: new Date(Date.now() + 60000),
      mfaVerified: false,
    });
  assert.equal(await sessionUser(raw), null);
});
test("chave ausente impede cadastrar MFA sem substituir ou inventar segredos", async () => {
  const actor = await person();
  const previous = process.env.MFA_ENCRYPTION_KEY;
  try {
    delete process.env.MFA_ENCRYPTION_KEY;
    await assert.rejects(
      () => beginMfaSetup(actor, { password: "mfa-test-password-long" }),
      MfaConfigurationError,
    );
  } finally {
    if (previous === undefined) delete process.env.MFA_ENCRYPTION_KEY;
    else process.env.MFA_ENCRYPTION_KEY = previous;
  }
});
