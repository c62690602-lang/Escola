import { randomBytes, randomUUID } from "node:crypto";
import { Secret } from "otpauth";
import QRCode from "qrcode";
import { and, eq, ne, gt } from "drizzle-orm";
import { z } from "zod";
import { db, pool } from "./db";
import { users, mfaCredentials, sessions, audits } from "./schema";
import { checkPassword, digest, type Actor } from "./auth";
import { ConflictError, AccessError } from "./service";
import {
  encryptMfaSecret,
  decryptMfaSecret,
  totpFor,
  matchingCounter,
  recoveryDigest,
  consumeFactor,
  mfaConfigured,
  MfaInvalidError,
} from "./mfa-crypto";
export async function mfaRateLimit(userId: string) {
  const result = await pool.query(
    `INSERT INTO login_attempts(key_hash,attempts,resets_at) VALUES($1,1,now()+interval '15 minutes') ON CONFLICT(key_hash) DO UPDATE SET attempts=CASE WHEN login_attempts.resets_at<now() THEN 1 ELSE login_attempts.attempts+1 END,resets_at=CASE WHEN login_attempts.resets_at<now() THEN now()+interval '15 minutes' ELSE login_attempts.resets_at END RETURNING attempts`,
    [digest("mfa:" + userId)],
  );
  if (result.rows[0].attempts > 10) throw new Error("RATE_LIMIT");
}
export async function mfaStatus(actor: Actor) {
  const [record] = await db
    .select({
      enabledAt: mfaCredentials.enabledAt,
      recoveryHashes: mfaCredentials.recoveryHashes,
    })
    .from(mfaCredentials)
    .where(eq(mfaCredentials.userId, actor.id));
  return {
    enabled: !!record?.enabledAt,
    enabledAt: record?.enabledAt ?? null,
    recoveryCodesRemaining: record?.recoveryHashes.length ?? 0,
    required: actor.platformAdmin && process.env.REQUIRE_ADMIN_MFA === "true",
    needsSetup: actor.needsMfaSetup ?? false,
    configured: mfaConfigured(),
  };
}
export async function beginMfaSetup(actor: Actor, input: unknown) {
  await mfaRateLimit(actor.id);
  const { password } = z
    .object({ password: z.string().min(1).max(256) })
    .parse(input);
  const [user] = await db.select().from(users).where(eq(users.id, actor.id));
  if (!user || !(await checkPassword(password, user.passwordHash)))
    throw new AccessError("Senha atual inválida");
  const secret = new Secret({ size: 20 }).base32;
  const encrypted = encryptMfaSecret(secret, actor.id);
  await db.transaction(async (tx) => {
    const [lockedUser] = await tx
      .select({ passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, actor.id))
      .for("update");
    if (!lockedUser || lockedUser.passwordHash !== user.passwordHash)
      throw new AccessError("A senha foi alterada; entre novamente");
    const [record] = await tx
      .select()
      .from(mfaCredentials)
      .where(eq(mfaCredentials.userId, actor.id));
    if (record?.enabledAt) throw new ConflictError("MFA já está ativo");
    await tx
      .insert(mfaCredentials)
      .values({
        userId: actor.id,
        pendingEncrypted: encrypted,
        pendingUntil: new Date(Date.now() + 10 * 60_000),
      })
      .onConflictDoUpdate({
        target: mfaCredentials.userId,
        set: {
          pendingEncrypted: encrypted,
          pendingUntil: new Date(Date.now() + 10 * 60_000),
        },
      });
  });
  const otp = totpFor(secret, user.email);
  return {
    manualKey: secret,
    qrCodeDataUrl: await QRCode.toDataURL(otp.toString(), {
      width: 240,
      margin: 2,
    }),
    expiresInMinutes: 10,
  };
}
export async function confirmMfaSetup(
  actor: Actor,
  sessionToken: string,
  input: unknown,
) {
  await mfaRateLimit(actor.id);
  const { code } = z.object({ code: z.string().regex(/^\d{6}$/) }).parse(input);
  const codes = Array.from({ length: 10 }, () =>
    randomBytes(10)
      .toString("hex")
      .match(/.{1,5}/g)!
      .join("-"),
  );
  await db.transaction(async (tx) => {
    await tx
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, actor.id))
      .for("update");
    const [record] = await tx
      .select()
      .from(mfaCredentials)
      .where(eq(mfaCredentials.userId, actor.id))
      .for("update");
    if (
      !record?.pendingEncrypted ||
      !record.pendingUntil ||
      record.pendingUntil <= new Date() ||
      record.enabledAt
    )
      throw new ConflictError(
        "Cadastro MFA expirado ou indisponível; inicie novamente",
      );
    const secret = decryptMfaSecret(record.pendingEncrypted, actor.id);
    const counter = matchingCounter(secret, code, -1);
    if (counter === null)
      throw new MfaInvalidError("Código inválido ou expirado");
    await tx
      .update(mfaCredentials)
      .set({
        secretEncrypted: record.pendingEncrypted,
        pendingEncrypted: null,
        pendingUntil: null,
        enabledAt: new Date(),
        lastCounter: counter,
        recoveryHashes: codes.map(recoveryDigest),
      })
      .where(eq(mfaCredentials.userId, actor.id));
    await tx
      .delete(sessions)
      .where(
        and(
          eq(sessions.userId, actor.id),
          ne(sessions.tokenHash, digest(sessionToken)),
        ),
      );
    const result = await tx
      .update(sessions)
      .set({ mfaVerified: true, setupOnly: false })
      .where(
        and(
          eq(sessions.tokenHash, digest(sessionToken)),
          eq(sessions.userId, actor.id),
          gt(sessions.expiresAt, new Date()),
        ),
      )
      .returning();
    if (!result.length) throw new AccessError("Sessão indisponível");
    await tx.insert(audits).values({
      id: randomUUID(),
      actorId: actor.id,
      action: "mfa.enabled",
      entityId: actor.id,
    });
  });
  return { recoveryCodes: codes };
}
export async function disableMfa(actor: Actor, input: unknown) {
  if (actor.platformAdmin && process.env.REQUIRE_ADMIN_MFA === "true")
    throw new AccessError(
      "MFA é obrigatório para administradores neste ambiente",
    );
  if (!actor.mfaVerified)
    throw new AccessError("Entre novamente usando o segundo fator");
  await mfaRateLimit(actor.id);
  const { password, code } = z
    .object({
      password: z.string().min(1).max(256),
      code: z.string().min(6).max(40),
    })
    .parse(input);
  const [user] = await db.select().from(users).where(eq(users.id, actor.id));
  if (!user || !(await checkPassword(password, user.passwordHash)))
    throw new AccessError("Senha atual inválida");
  await db.transaction(async (tx) => {
    const [lockedUser] = await tx
      .select({ passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, actor.id))
      .for("update");
    if (!lockedUser || lockedUser.passwordHash !== user.passwordHash)
      throw new AccessError("A senha foi alterada; entre novamente");
    const [record] = await tx
      .select()
      .from(mfaCredentials)
      .where(eq(mfaCredentials.userId, actor.id))
      .for("update");
    if (!record?.enabledAt) throw new ConflictError("MFA não está ativo");
    consumeFactor(record, actor.id, code);
    await tx.delete(mfaCredentials).where(eq(mfaCredentials.userId, actor.id));
    await tx.delete(sessions).where(eq(sessions.userId, actor.id));
    await tx.insert(audits).values({
      id: randomUUID(),
      actorId: actor.id,
      action: "mfa.disabled",
      entityId: actor.id,
    });
  });
}
