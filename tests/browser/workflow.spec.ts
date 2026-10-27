import { expect } from "@playwright/test";
import { test } from "./fixtures";
import AxeBuilder from "@axe-core/playwright";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, pool } from "../../src/lib/db";
import {
  users,
  sessions,
  institutions,
  tasks,
  projects,
  audits,
} from "../../src/lib/schema";
import { hashPassword, digest } from "../../src/lib/auth";
const id = randomUUID(),
  email = `${id}@browser.example`,
  password = randomUUID();
let schoolId: string | undefined;
test.beforeAll(async () => {
  await db.insert(users).values({
    id,
    name: "Pessoa sintética",
    email,
    passwordHash: await hashPassword(password),
    platformAdmin: true,
  });
});
test.afterAll(async () => {
  if (schoolId) {
    for (const table of [audits, tasks, projects])
      await db.delete(table).where(eq(table.institutionId, schoolId));
    await db.delete(institutions).where(eq(institutions.id, schoolId));
  }
  await db.delete(sessions).where(eq(sessions.userId, id));
  await db.delete(users).where(eq(users.id, id));
  await pool.query("DELETE FROM login_attempts WHERE key_hash=$1", [
    digest(email),
  ]);
});
test("login, instituição vazia, implantação e tarefa persistida; desktop e mobile", async ({
  page,
}) => {
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { name: "Vamos conectar?" }),
  ).toBeVisible();
  let a11y = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(
    a11y.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([]);
  await page.getByLabel("E-mail", { exact: true }).fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Entrar na plataforma" }).click();
  await expect(
    page.getByRole("heading", { name: "Um olhar para o que importa." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Instituições", exact: true }).click();
  await page.getByRole("button", { name: "Nova instituição" }).click();
  await page.getByLabel("Nome", { exact: true }).fill("Escola E2E · Sintética");
  await page.getByLabel("Cidade", { exact: true }).fill("Cidade sintética");
  await page.getByLabel("UF", { exact: true }).fill("SP");
  await page.getByRole("button", { name: "Salvar cadastro" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  schoolId = await page.getByLabel("Instituição ativa").inputValue();
  await page.getByRole("button", { name: "Visão geral", exact: true }).click();
  await expect(
    page.getByText("Jornada ainda não iniciada", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Implantação", exact: true }).click();
  await page
    .getByRole("button", { name: "Iniciar implantação", exact: true })
    .click();
  await page.getByLabel("Data de início").fill("2026-10-01");
  await page.getByRole("button", { name: "Iniciar jornada" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("heading", {
      name: "Conhecimento da instituição",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Nova tarefa" }).click();
  await page
    .getByLabel("Título", { exact: true })
    .fill("Conferir documentação sintética");
  await page.getByLabel("Prazo", { exact: true }).fill("2026-12-20");
  await page.getByLabel("Responsável", { exact: true }).fill("Equipe de teste");
  await page.getByRole("button", { name: "Salvar cadastro" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Planos e tarefas", exact: true })
    .click();
  await expect(
    page.getByText("Conferir documentação sintética", { exact: true }),
  ).toBeVisible();
  a11y = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(
    a11y.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([]);
  await page.getByRole("button", { name: "Visão geral", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Um olhar para o que importa." }),
  ).toBeVisible();
  a11y = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(
    a11y.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([]);
  await page.screenshot({
    path: "test-results/nexo-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("heading", { name: "Um olhar para o que importa." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/nexo-mobile.png",
    fullPage: true,
  });
});
