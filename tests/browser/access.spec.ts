import { expect, type Page } from "@playwright/test";
import { test } from "./fixtures";
import AxeBuilder from "@axe-core/playwright";
import { randomUUID } from "node:crypto";
import { readFile, unlink } from "node:fs/promises";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { db, pool } from "../../src/lib/db";
import {
  users,
  institutions,
  memberships,
  accountTokens,
  audits,
  sessions,
} from "../../src/lib/schema";
import { hashPassword, digest } from "../../src/lib/auth";
import { createInstitution } from "../../src/lib/service";
const adminId = randomUUID(),
  adminEmail = adminId + "@browser-access.example",
  email = randomUUID() + "@browser-invite.example",
  password = randomUUID();
let schoolId: string, userId: string | undefined;
const mailFiles: string[] = [];
test.beforeAll(async () => {
  const admin = {
    id: adminId,
    name: "Admin acessos sintético",
    email: adminEmail,
    platformAdmin: true,
  };
  await db
    .insert(users)
    .values({ ...admin, passwordHash: await hashPassword(password) });
  schoolId = await createInstitution(admin, { name: "Escola acessos E2E" });
});
test.afterAll(async () => {
  await db
    .delete(accountTokens)
    .where(eq(accountTokens.institutionId, schoolId));
  await db.delete(accountTokens).where(eq(accountTokens.email, email));
  await db.delete(audits).where(eq(audits.institutionId, schoolId));
  await db.delete(memberships).where(eq(memberships.institutionId, schoolId));
  await db.delete(institutions).where(eq(institutions.id, schoolId));
  const ids = [adminId, ...(userId ? [userId] : [])];
  await db.delete(audits).where(inArray(audits.actorId, ids));
  await db.delete(sessions).where(inArray(sessions.userId, ids));
  await db.delete(users).where(inArray(users.id, ids));
  await pool.query("DELETE FROM login_attempts WHERE key_hash=ANY($1)", [
    [digest(email), digest(adminEmail), digest("recovery:" + email)],
  ]);
  for (const file of mailFiles) await unlink(file).catch(() => {});
});
async function signIn(page: Page, email: string, password: string) {
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
test("convite, aceitação, gestão de papel, recuperação e revogação completos", async ({
  page,
  browser,
}) => {
  await signIn(page, adminEmail, password);
  await page.getByRole("button", { name: "Usuários e acessos" }).click();
  await page.getByLabel("Instituição", { exact: true }).selectOption(schoolId);
  await page.getByLabel("E-mail do convidado").fill(email);
  await page.getByLabel("Papel", { exact: true }).selectOption("diretor");
  await page.getByRole("button", { name: "Gerar convite" }).click();
  const linkInput = page.getByLabel("Link privado do convite");
  await expect(linkInput).toBeVisible();
  const link = await linkInput.inputValue();
  await accessible(page);
  const context = await browser.newContext();
  const invited = await context.newPage();
  try {
    await invited.goto(link);
    await expect(
      invited.getByRole("heading", { name: "Aceitar convite" }),
    ).toBeVisible();
    await expect(invited).toHaveURL(/\/convite$/);
    await invited
      .getByLabel("Nome", { exact: true })
      .fill("Pessoa convidada sintética");
    await invited
      .getByLabel("Senha para conta nova")
      .fill("invited-password-strong");
    await accessible(invited);
    await invited
      .getByRole("button", { name: "Aceitar convite", exact: true })
      .click();
    await expect(invited.getByRole("status")).toContainText("Convite aceito");
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email));
    userId = user.id;
    await signIn(invited, email, "invited-password-strong");
    await expect(
      invited.getByRole("button", { name: "Usuários e acessos" }),
    ).toHaveCount(0);
    const denied = await context.request.get(
      `/api/institutions/${schoolId}/access`,
    );
    expect(denied.status()).toBe(403);
    await page.reload();
    await expect(page.getByText(email, { exact: true })).toHaveCount(2);
    page.once("dialog", (d) => d.accept());
    await page
      .getByLabel("Papel de Pessoa convidada sintética")
      .selectOption("gestor");
    await expect
      .poll(async () =>
        (await context.request.get("/api/institutions")).status(),
      )
      .toBe(401);
    await signIn(invited, email, "invited-password-strong");
    await invited.goto("/recuperar");
    await invited.getByLabel("E-mail", { exact: true }).fill(email);
    await accessible(invited);
    await invited
      .getByRole("button", { name: "Solicitar recuperação" })
      .click();
    await expect(invited.getByRole("status")).toContainText(
      "caixa de saída local",
    );
    const [delivery] = await db
      .select({ id: accountTokens.id })
      .from(accountTokens)
      .where(
        and(
          eq(accountTokens.email, email),
          eq(accountTokens.kind, "recovery"),
          isNull(accountTokens.revokedAt),
        ),
      );
    const file = ".local/mail/" + delivery.id + ".json";
    mailFiles.push(file);
    const message = JSON.parse(await readFile(file, "utf8"));
    await invited.goto(message.path);
    await expect(
      invited.getByRole("heading", { name: "Definir nova senha" }),
    ).toBeVisible();
    await invited
      .getByLabel("Nova senha", { exact: true })
      .fill("recovered-password-strong");
    await invited.getByRole("button", { name: "Salvar nova senha" }).click();
    await expect(invited.getByRole("status")).toContainText("Senha alterada");
    await signIn(invited, email, "recovered-password-strong");
    await page.reload();
    page.once("dialog", (d) => d.accept());
    await page
      .getByRole("button", { name: "Revogar acesso", exact: true })
      .click();
    await expect(
      page.getByText("Nenhum vínculo institucional.", { exact: false }),
    ).toBeVisible();
    await expect
      .poll(async () =>
        (await context.request.get("/api/institutions")).status(),
      )
      .toBe(401);
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  } finally {
    await context.close();
  }
});
