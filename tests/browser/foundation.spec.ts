import { expect, type Page } from "@playwright/test";
import { test } from "./fixtures";
import AxeBuilder from "@axe-core/playwright";
import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { db, pool } from "../../src/lib/db";
import {
  users,
  memberships,
  institutions,
  units,
  audits,
  sessions,
  mfaCredentials,
} from "../../src/lib/schema";
import { hashPassword, digest } from "../../src/lib/auth";
import { createInstitution } from "../../src/lib/service";
import { totpFor } from "../../src/lib/mfa-crypto";
const admin = {
  id: randomUUID(),
  name: "Admin fundação sintético",
  email: randomUUID() + "@foundation-browser.example",
  platformAdmin: true,
};
const member = {
  id: randomUUID(),
  name: "Gestor limitado sintético",
  email: randomUUID() + "@foundation-browser.example",
  platformAdmin: false,
};
const password = randomUUID();
let schoolId: string;
test.beforeAll(async () => {
  for (const actor of [admin, member])
    await db
      .insert(users)
      .values({ ...actor, passwordHash: await hashPassword(password) });
  schoolId = await createInstitution(admin, {
    name: "Escola fundação E2E",
    timezone: "America/Manaus",
  });
  await db
    .insert(memberships)
    .values({
      userId: member.id,
      institutionId: schoolId,
      role: "gestor",
      permissions: ["units.write"],
    });
});
test.afterAll(async () => {
  for (const table of [audits, units, memberships])
    await db.delete(table).where(eq(table.institutionId, schoolId));
  await db.delete(institutions).where(eq(institutions.id, schoolId));
  const ids = [admin.id, member.id];
  await db.delete(audits).where(inArray(audits.actorId, ids));
  await db.delete(sessions).where(inArray(sessions.userId, ids));
  await db.delete(mfaCredentials).where(inArray(mfaCredentials.userId, ids));
  await db.delete(users).where(inArray(users.id, ids));
  await pool.query("DELETE FROM login_attempts WHERE key_hash=ANY($1)", [
    [digest(admin.email), digest(member.email), digest("mfa:" + admin.id)],
  ]);
});
async function signIn(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("E-mail", { exact: true }).fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Entrar na plataforma" }).click();
  await expect(
    page.getByRole("heading", { name: "Um olhar para o que importa." }),
  ).toBeVisible();
}
async function accessible(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.failureSummary),
    })),
  ).toEqual([]);
}
test("central administrativa mostra instituição real; permissão limitada libera apenas unidades", async ({
  page,
  browser,
}) => {
  await signIn(page, admin.email);
  await page
    .getByRole("button", { name: "Central Certtifica", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Painel de Comando Geral" }),
  ).toBeVisible();
  await expect(
    page.getByText("Escola fundação E2E", { exact: true }),
  ).toBeVisible();
  await accessible(page);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const context = await browser.newContext();
  const limited = await context.newPage();
  try {
    await signIn(limited, member.email);
    await expect(
      limited.getByRole("button", { name: "Nova tarefa", exact: true }),
    ).toHaveCount(0);
    await limited.getByRole("button", { name: "Adicionar unidade" }).click();
    await limited
      .getByLabel("Nome", { exact: true })
      .fill("Unidade via permissão específica");
    await limited.getByRole("button", { name: "Salvar cadastro" }).click();
    await expect(limited.getByRole("dialog")).toHaveCount(0);
    await expect(
      limited.getByText("Unidade via permissão específica", { exact: true }),
    ).toBeVisible();
    expect((await context.request.get("/api/central")).status()).toBe(403);
    expect(
      (
        await context.request.get(`/api/institutions/${schoolId}/report`)
      ).status(),
    ).toBe(403);
  } finally {
    await context.close();
  }
});
test("MFA é cadastrado e confirmado na interface; login exige segundo fator e código de recuperação", async ({
  page,
}) => {
  await signIn(page, admin.email);
  await page.getByRole("button", { name: "Segurança da conta" }).click();
  await expect(
    page.getByRole("heading", { name: "Segurança da conta" }),
  ).toBeVisible();
  await page.getByLabel("Senha atual", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Configurar segundo fator" }).click();
  const manual = page.getByLabel("Chave manual");
  await expect(manual).toBeVisible();
  const secret = await manual.inputValue();
  await accessible(page);
  await page
    .getByLabel("Código de seis dígitos")
    .fill(totpFor(secret).generate());
  await page.getByRole("button", { name: "Confirmar segundo fator" }).click();
  await expect(
    page.getByRole("heading", { name: "Guarde seus códigos de recuperação" }),
  ).toBeVisible();
  const recovery = await page
    .locator(".recovery-codes code")
    .first()
    .textContent();
  expect(recovery).toBeTruthy();
  await page
    .getByRole("button", { name: "Guardei os códigos. Continuar" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Um olhar para o que importa." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Segurança da conta" }).click();
  await page
    .getByRole("button", { name: "Sair da conta", exact: true })
    .click();
  await page.getByLabel("E-mail", { exact: true }).fill(admin.email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Entrar na plataforma" }).click();
  await expect(
    page.getByLabel("Código do autenticador ou de recuperação"),
  ).toBeVisible();
  await page
    .getByLabel("Código do autenticador ou de recuperação")
    .fill(recovery!);
  await page.getByRole("button", { name: "Entrar na plataforma" }).click();
  await expect(
    page.getByRole("heading", { name: "Um olhar para o que importa." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Segurança da conta" }).click();
  await expect(
    page.getByText("9 códigos de recuperação disponíveis.", { exact: false }),
  ).toBeVisible();
  await accessible(page);
});
