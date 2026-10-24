import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const routes = [
  "/",
  "/solucao",
  "/modulos",
  "/psicossocial",
  "/prontidao",
  "/ser-saude",
  "/central-de-inteligencia",
  "/como-funciona",
  "/acreditacao",
  "/experiencias",
  "/experiencia-digital",
  "/sobre",
  "/visao-de-futuro",
  "/conteudos",
  "/contato",
  "/agendar-apresentacao",
  "/privacidade",
  "/termos",
];
test("todas as rotas têm conteúdo, metadados e navegação válidos", async ({
  page,
}) => {
  for (const route of routes) {
    const r = await page.goto(route);
    expect(r?.status(), route).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page).toHaveTitle(/NEXO/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /.{20}/,
    );
  }
  expect((await page.goto("/caminho-inexistente"))?.status()).toBe(404);
});
test("painel interativo, menu móvel e layout sem vazamento horizontal", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Somente necessários" }).click();
  await page.getByRole("tab", { name: "Planos de ação" }).click();
  await expect(page.locator(".dashboard").getByRole("tabpanel")).toContainText(
    "Revisar distribuição",
  );
  await page.getByRole("tab", { name: "Calendário", exact: true }).click();
  await expect(page.locator(".dashboard").getByRole("tabpanel")).toContainText(
    "Campanha sazonal",
  );
  await page.getByRole("tab", { name: "Visão geral" }).click();
  await page.getByLabel("Mês da demonstração").selectOption("Setembro");
  await expect(page.locator(".dashboard").getByRole("tabpanel")).toContainText(
    "91",
  );
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: "test-results/home-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await page.locator("summary").filter({ hasText: "A solução" }).click();
  await page.getByRole("link", { name: "Visão geral", exact: true }).click();
  await expect(page).toHaveURL("/solucao");
  for (const route of [
    "/",
    "/contato",
    "/central-de-inteligencia",
    "/acreditacao",
  ]) {
    await page.goto(route);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      route,
    ).toBe(true);
  }
  await page.goto("/");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: "test-results/home-mobile.png",
    fullPage: true,
  });
});
test("formulário persiste, administração autentica, consulta e exclui", async ({
  page,
  request,
}) => {
  expect((await request.get("/api/admin/leads")).status()).toBe(401);
  const hostile = await request.post("/api/leads", {
    headers: { Origin: "https://example.org" },
    data: {},
  });
  expect(hostile.status()).toBe(403);
  const invalid = await request.post("/api/leads", {
    headers: { Origin: "http://localhost:3100" },
    data: { name: "A" },
  });
  expect(invalid.status()).toBe(400);
  await page.goto("/agendar-apresentacao");
  await page.getByLabel("Seu nome", { exact: false }).fill("Pessoa de Teste");
  await page.getByLabel("Nome da instituição").fill("Instituição E2E Fictícia");
  await page.getByLabel("Seu cargo").fill("Direção");
  await page.getByLabel("Cidade / UF").fill("Salvador/BA");
  await page.getByLabel("E-mail profissional").fill("teste@example.com");
  await page.getByLabel("Telefone / WhatsApp").fill("71999999999");
  await page
    .getByLabel("Principal interesse")
    .selectOption("Programa completo");
  await page.getByLabel("Li o").check();
  await page.waitForTimeout(2700);
  await page
    .getByRole("button", { name: "Solicitar uma apresentação" })
    .click();
  await expect(
    page.getByText("Solicitação registrada com sucesso.", { exact: false }),
  ).toBeVisible();
  await page.goto("/admin");
  await page
    .getByLabel("Senha administrativa")
    .fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Instituição E2E Fictícia" }),
  ).toBeVisible();
  await expect(page.locator(".lead-card")).toContainText("não autorizadas");
  page.on("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Excluir contato" }).click();
  await expect(
    page.getByText("Nenhuma solicitação nesta página."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await expect(page.getByLabel("Senha administrativa")).toBeVisible();
  expect((await page.request.get("/api/admin/leads")).status()).toBe(401);
});
test("acessibilidade automatizada em páginas representativas", async ({
  page,
}) => {
  for (const route of ["/", "/contato", "/modulos"]) {
    await page.goto(route);
    await page.evaluate(async () => {
      await Promise.all(
        document
          .getAnimations()
          .filter((a) => a.effect?.getTiming().iterations !== Infinity)
          .map((a) => a.finished.catch(() => {})),
      );
    });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
      route,
    ).toEqual([]);
  }
});

test("exploração das frentes, cenários, jornada e dúvidas funciona com mouse e teclado", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Somente necessários" }).click();
  await page.locator(".network-node").filter({ hasText: "Saúde" }).click();
  await expect(page.locator(".scene-insight")).toContainText(
    "SER Saúde na Escola",
  );
  await page.getByRole("button", { name: "Pausar animações" }).click();
  await expect(page.locator(".ring-b")).toHaveCSS(
    "animation-play-state",
    "paused",
  );
  const tabs = page.getByRole("tablist", { name: "Frentes de cuidado" });
  await tabs.getByRole("tab", { name: /Prontidão/ }).click();
  await expect(page.locator("#front-panel")).toContainText(
    "Novos profissionais na escola",
  );
  await tabs.getByRole("tab", { name: /Prontidão/ }).press("ArrowRight");
  await expect(tabs.getByRole("tab", { name: /Saúde/ })).toBeFocused();
  await expect(page.locator("#front-panel")).toContainText("Retorno às aulas");
  await page
    .getByRole("button", { name: "A equipe mudou. E os treinamentos?" })
    .click();
  await expect(page.locator(".situation-result")).toContainText(
    "Histórico e planejamento",
  );
  await page
    .getByRole("button", { name: "Informações dispersas", exact: true })
    .click();
  await expect(page.locator(".situation-result")).toContainText(
    "Uma nova contratação",
  );
  await page
    .getByRole("tablist", { name: "Etapas do programa" })
    .getByRole("tab", { name: /Acompanhar/ })
    .click();
  await expect(page.locator("#journey-panel")).toContainText(
    "Uma reunião estratégica por mês",
  );
  await page
    .getByRole("button", {
      name: "O NEXO substitui o sistema que minha escola já usa?",
    })
    .click();
  await expect(
    page.getByRole("region", {
      name: "O NEXO substitui o sistema que minha escola já usa?",
    }),
  ).toContainText("não é um sistema de notas");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".ring-b")).toHaveCSS("animation-name", "none");
});
