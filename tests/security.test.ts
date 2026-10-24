import { test } from "node:test";
import assert from "node:assert/strict";
import { createSession, validSession, constantEqual } from "../lib/security";
test("sessão exige configuração, valida assinatura e invalida após rotação", () => {
  const prev = process.env.ADMIN_PASSWORD;
  try {
    delete process.env.ADMIN_PASSWORD;
    assert.equal(validSession(createSession()), false);
    process.env.ADMIN_PASSWORD = "test-only-not-a-production-secret";
    const token = createSession();
    assert.equal(validSession(token), true);
    assert.equal(validSession(token + "a"), false);
    assert.equal(validSession("0.a.b"), false);
    process.env.ADMIN_PASSWORD = "rotated-test-only-not-for-production";
    assert.equal(validSession(token), false);
  } finally {
    if (prev === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = prev;
  }
});
test("comparação de senha rejeita diferenças e comprimentos diferentes", () => {
  assert.equal(constantEqual("abc", "abc"), true);
  assert.equal(constantEqual("abc", "abcd"), false);
  assert.equal(constantEqual("abc", "abd"), false);
});
