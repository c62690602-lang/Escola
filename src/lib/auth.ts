import {
  randomBytes,
  scrypt as scryptCb,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { promisify } from "node:util";
import { and, eq, gt } from "drizzle-orm";
import { db, pool } from "./db";
import { sessions, users } from "./schema";
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
export async function login(email: string, password: string) {
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
  const token = randomBytes(32).toString("hex");
  await db.insert(sessions).values({
    tokenHash: digest(token),
    userId: user.id,
    expiresAt: new Date(Date.now() + 8 * 3600_000),
  });
  return token;
}
export async function sessionUser(token?: string) {
  if (!token) return null;
  const [row] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      platformAdmin: users.platformAdmin,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(
      and(
        eq(sessions.tokenHash, digest(token)),
        gt(sessions.expiresAt, new Date()),
      ),
    );
  return row ?? null;
}
export type Actor = NonNullable<Awaited<ReturnType<typeof sessionUser>>>;
