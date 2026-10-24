import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { query, rateLimit } from "../lib/db";
test("SQLite persiste dados parametrizados e limites de abuso atomicamente", async () => {
  process.env.NEXO_DATA_DIR = await mkdtemp(
    path.join(tmpdir(), "nexo-db-test-"),
  );
  delete process.env.DATABASE_URL;
  const payload = JSON.stringify({
    name: "Teste '); DROP TABLE leads; --",
    marketing: false,
  });
  await query("INSERT INTO leads (id,created_at,payload) VALUES ($1,$2,$3)", [
    "test-id",
    new Date().toISOString(),
    payload,
  ]);
  const found = await query("SELECT payload FROM leads WHERE id=$1", [
    "test-id",
  ]);
  assert.equal(found[0].payload, payload);
  const outcomes = await Promise.all(
    Array.from({ length: 7 }, () => rateLimit("abuse-test", 5, 600000)),
  );
  assert.equal(outcomes.filter(Boolean).length, 5);
  assert.equal(
    (await stat(path.join(process.env.NEXO_DATA_DIR, "nexo.sqlite"))).mode &
      0o777,
    0o600,
  );
  await query("DELETE FROM leads WHERE id=$1", ["test-id"]);
  assert.equal((await query("SELECT id FROM leads")).length, 0);
});
