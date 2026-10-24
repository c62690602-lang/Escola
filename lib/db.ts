import { mkdir, chmod } from "node:fs/promises";
import path from "node:path";
import type { DatabaseSync } from "node:sqlite";
import type { Pool } from "pg";
let pool: Pool | undefined;
let sqlite: DatabaseSync | undefined;
let initialized: Promise<void> | undefined;
async function raw(
  sql: string,
  values: unknown[] = [],
): Promise<Record<string, unknown>[]> {
  if (process.env.DATABASE_URL) {
    if (!pool) {
      const { Pool } = await import("pg");
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 5,
        connectionTimeoutMillis: 5000,
      });
    }
    return (await pool.query(sql, values)).rows;
  }
  if (process.env.NODE_ENV === "production")
    throw new Error("DATABASE_URL is required in production");
  if (!sqlite) {
    const dir = path.resolve(
      /* turbopackIgnore: true */ process.env.NEXO_DATA_DIR || ".data",
    );
    await mkdir(dir, { recursive: true, mode: 0o700 });
    const { DatabaseSync } = await import("node:sqlite");
    sqlite = new DatabaseSync(path.join(dir, "nexo.sqlite"));
    await chmod(path.join(dir, "nexo.sqlite"), 0o600);
    sqlite.exec("PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;");
  }
  const ordered: unknown[] = [];
  const query = sql.replace(/\$(\d+)/g, (_, n) => {
    ordered.push(values[Number(n) - 1]);
    return "?";
  });
  return sqlite
    .prepare(query)
    .all(...(ordered as (string | number | null)[])) as Record<
    string,
    unknown
  >[];
}
async function init() {
  await raw(
    `CREATE TABLE IF NOT EXISTS leads (id TEXT PRIMARY KEY, created_at TEXT NOT NULL, payload TEXT NOT NULL)`,
  );
  await raw(
    `CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, hits INTEGER NOT NULL, expires_at TEXT NOT NULL)`,
  );
}
export async function query(sql: string, values: unknown[] = []) {
  if (!initialized)
    initialized = init().catch((e) => {
      initialized = undefined;
      throw e;
    });
  await initialized;
  return raw(sql, values);
}
export async function rateLimit(key: string, max: number, windowMs: number) {
  const bucket = Math.floor(Date.now() / windowMs);
  const scoped = `${key}:${bucket}`;
  const until = new Date((bucket + 1) * windowMs).toISOString();
  await query("DELETE FROM rate_limits WHERE expires_at < $1", [
    new Date().toISOString(),
  ]);
  const rows = await query(
    "INSERT INTO rate_limits (key,hits,expires_at) VALUES ($1,1,$2) ON CONFLICT (key) DO UPDATE SET hits = rate_limits.hits + 1 RETURNING hits",
    [scoped, until],
  );
  return Number(rows[0].hits) <= max;
}
