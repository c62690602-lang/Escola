import { readdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { pool } from "../src/lib/db";
const directory = new URL("../migrations/", import.meta.url);
const client = await pool.connect();
try {
  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock(62690602)");
  await client.query(
    "CREATE TABLE IF NOT EXISTS schema_migrations(name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())",
  );
  const files = (await readdir(directory))
    .filter((f) => /^\d+_.+\.sql$/.test(f))
    .sort();
  for (const name of files) {
    const source = await readFile(new URL(name, directory), "utf8");
    const checksum = createHash("sha256").update(source).digest("hex");
    const { rows } = await client.query(
      "SELECT checksum FROM schema_migrations WHERE name=$1",
      [name],
    );
    if (rows.length) {
      if (rows[0].checksum !== checksum)
        throw new Error(`Migration already applied was changed: ${name}`);
      continue;
    }
    // 001 is idempotent, so databases created by the previous runner are adopted safely.
    await client.query(source);
    await client.query(
      "INSERT INTO schema_migrations(name,checksum) VALUES($1,$2)",
      [name, checksum],
    );
    console.log(`Applied ${name}`);
  }
  await client.query("COMMIT");
  console.log("Database schema up to date");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  await pool.end();
}
