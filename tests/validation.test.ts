import { test } from "node:test";
import assert from "node:assert/strict";
import { validateLead } from "../lib/validation";
const lead = {
  name: "Pessoa Teste",
  institution: "Escola Exemplo",
  role: "Direção",
  city: "Salvador/BA",
  email: "CONTATO@example.com",
  phone: "(71) 99999-9999",
  employees: "30",
  units: "2",
  interest: "Programa completo",
  message: "Gostaria de conhecer.",
  privacy: true,
  marketing: false,
};
test("aceita contato válido, normaliza e não exige marketing", () => {
  const r = validateLead(lead);
  assert.ok("data" in r);
  assert.equal(r.data.email, "contato@example.com");
  assert.equal(r.data.marketing, false);
});
for (const [name, value] of Object.entries({
  email: "invalido",
  phone: "123",
  interest: "inventado",
  privacy: false,
  employees: "-2",
  units: "1.5",
  message: "x".repeat(2001),
  name: "A",
})) {
  test(`rejeita ${name} inválido`, () => {
    assert.ok("error" in validateLead({ ...lead, [name]: value }));
  });
}
test("rejeita payloads não estruturados", () => {
  for (const value of [null, [], false, "texto"])
    assert.ok("error" in validateLead(value));
});
test("campos opcionais vazios são aceitos", () => {
  assert.ok(
    "data" in validateLead({ ...lead, employees: "", units: "", message: "" }),
  );
});
