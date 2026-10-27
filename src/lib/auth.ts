import {
  randomBytes,
  scrypt as scryptCb,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { promisify } from "node:util";
import { and, eq, gt } from "drizzle-orm";
import { db, pool } from "./db";
import { sessions, users, mfaCredentials } from "./schema";
import { consumeFactor, MfaRequiredError, MfaInvalidError } from "./mfa-crypto";
const scrypt = promisify(scryptCb);
export const digest = (s: string) =>
  createHash("sha256").update(s).digest("hex");
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${key.toString("hex")}`;
}
export async function checkPassword(password: string, hash: string) {
  const [salt, key] = hash.split(":");
  const computed = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(key, "hex");
  return (
    expected.length === computed.length && timingSafeEqual(expected, computed)
  );
}
export async function login(email: string, password: string, code?: string) {
  const key = digest(email.toLowerCase());
  const result = await pool.query(
    `INSERT INTO login_attempts(key_hash,attempts,resets_at) VALUES($1,1,now()+interval '15 minutes') ON CONFLICT(key_hash) DO UPDATE SET attempts=CASE WHEN login_attempts.resets_at<now() THEN 1 ELSE login_attempts.attempts+1 END,resets_at=CASE WHEN login_attempts.resets_at<now() THEN now()+interval '15 minutes' ELSE login_attempts.resets_at END RETURNING attempts`,
    [key],
  );
  if (result.rows[0].attempts > 10) throw new Error("RATE_LIMIT");
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()));
  const fallback = "00000000000000000000000000000000:" + "00".repeat(64);
  const valid = await checkPassword(password, user?.passwordHash ?? fallback);
  if (!user || !valid) return null;
  return db.transaction(async (tx) => {
    const [current] = await tx
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .for("update");
    if (!current || current.passwordHash !== user.passwordHash) return null;
    const [record] = await tx
      .select()
      .from(mfaCredentials)
      .where(eq(mfaCredentials.userId, user.id))
      .for("update");
    let mfaVerified = false;
    if (record?.enabledAt) {
      if (!code)
        throw new MfaRequiredError(
          "Informe o código do autenticador ou um código de recuperação",
        );
      if (code.length > 40) throw new MfaInvalidError("Código inválido");
      const updated = consumeFactor(record, user.id, code);
      await tx
        .update(mfaCredentials)
        .set(updated)
        .where(eq(mfaCredentials.userId, user.id));
      mfaVerified = true;
    }
    const setupOnly =
      current.platformAdmin &&
      process.env.REQUIRE_ADMIN_MFA === "true" &&
      !record?.enabledAt;
    const token = randomBytes(32).toString("hex");
    await tx
      .insert(sessions)
      .values({
        tokenHash: digest(token),
        userId: user.id,
        expiresAt: new Date(Date.now() + 8 * 3600_000),
        mfaVerified,
        setupOnly,
      });
    return token;
  });
}

export type Actor = {
  id: string;
  name: string;
  email: string;
  platformAdmin: boolean;
  needsMfaSetup?: boolean;
  mfaVerified?: boolean;
};
export async function sessionUser(token?: string): Promise<Actor | null> {
  if (!token) return null;
  const [row] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      platformAdmin: users.platformAdmin,
      mfaVerified: sessions.mfaVerified,
      needsMfaSetup: sessions.setupOnly,
      mfaEnabledAt: mfaCredentials.enabledAt,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .leftJoin(mfaCredentials, eq(mfaCredentials.userId, users.id))
    .where(
      and(
        eq(sessions.tokenHash, digest(token)),
        gt(sessions.expiresAt, new Date()),
      ),
    );
  if (!row) return null;
  if (row.mfaEnabledAt && !row.mfaVerified) return null;
  const { mfaEnabledAt, ...actor } = row;
  void mfaEnabledAt;
  return {
    ...actor,
    needsMfaSetup:
      row.needsMfaSetup ||
      (row.platformAdmin &&
        process.env.REQUIRE_ADMIN_MFA === "true" &&
        !row.mfaEnabledAt),
  };
}
