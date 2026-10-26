import {
  test,
  expect,
  type Page,
  type APIRequestContext,
} from "@playwright/test";
import { DatabaseSync } from "node:sqlite";
async function register(page: Page, email: string) {
  await page.goto("/inscription");
  await page.getByLabel("Votre nom").fill("Camille Test");
  await page.getByLabel("Adresse email").fill(email);
  await page
    .getByLabel("Mot de passe", { exact: true })
    .fill("Test-development-only-2026");
  await page
    .getByRole("button", { name: "Créer mon compte", exact: true })
    .click();
  await expect(page).toHaveURL(/\/offres$/);
}
async function api(request: APIRequestContext, url: string, data: unknown) {
  return request.post(url, {
    data,
    headers: { origin: "http://127.0.0.1:3001" },
  });
}
test("programme public exact, recherche, prix et menu mobile", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Comprendre l’IA.",
  );
  await page
    .getByRole("link", { name: "Découvrir le programme", exact: true })
    .click();
  await expect(page.locator("[data-module]")).toHaveCount(22);
  await expect(page.locator("[data-lesson]")).toHaveCount(132);
  await page.getByRole("searchbox").fill("confidentialité");
  await expect(page.locator("[data-module]")).not.toHaveCount(22);
  await expect(page.locator("[data-lesson]").first()).toBeVisible();
  await page.goto("/offres");
  await expect(page.locator(".plan-card")).toHaveCount(6);
  expect(
    (await page.locator(".plan-price strong").allTextContents())
      .map((value) => Number(value.replace(/\D/g, "")))
      .sort((a, b) => a - b),
  ).toEqual([5, 29, 79, 99, 119, 149]);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page.getByRole("link", { name: "Le programme", exact: true }).click();
  await expect(page.locator("[data-module]")).toHaveCount(22);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
test("compte, quiz serveur, isolation entre élèves et expiration", async ({
  page,
  context,
  browser,
}) => {
  await register(page, "student-one@example.test");
  await page.locator(".plan-card").nth(1).getByRole("button").click();
  await expect(page).toHaveURL(/\/espace$/);
  const cookie = (await context.cookies()).find(
    (cookie) => cookie.name === "academie_session",
  );
  expect(cookie?.httpOnly).toBe(true);
  expect((await context.request.get("/api/lessons/l002")).status()).toBe(403);
  const lesson = await context.request.get("/api/lessons/l001");
  expect(lesson.status()).toBe(200);
  expect(JSON.stringify(await lesson.json())).not.toContain("correctIndex");
  expect(
    (
      await api(context.request, "/api/lessons/l001/quiz", {
        answers: [0],
        score: 10,
      })
    ).status(),
  ).toBe(400);
  const tampered = await api(context.request, "/api/lessons/l001/quiz", {
    answers: Array(10).fill(3),
    score: 10,
    passed: true,
  });
  expect((await tampered.json()).score).toBe(0);
  expect((await context.request.get("/api/lessons/l002")).status()).toBe(403);
  await page.goto("/cours/l001");
  await expect(
    page.getByRole("heading", { name: "Le cours écrit", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Commencer le quiz", exact: true })
    .click();
  const answers = [0, 1, 0, 0, 1, 1, 0, 0, 0, 1];
  for (let i = 0; i < 10; i++) {
    await page.locator("input[type=radio]").nth(answers[i]).check();
    await page
      .getByRole("button", {
        name: i === 9 ? "Corriger mon quiz" : "Question suivante",
        exact: true,
      })
      .click();
  }
  await expect(
    page.getByRole("heading", { name: "Leçon validée, bravo !" }),
  ).toBeVisible();
  await page.goto("/espace");
  await expect(page.getByTestId("completed-count")).toContainText("1");
  const second = await browser.newContext();
  const other = await second.newPage();
  await register(other, "student-two@example.test");
  await other.goto("/espace");
  await expect(other.getByTestId("completed-count")).toHaveText("0 / 132");
  await second.close();
  await page.goto("/compte");
  await page
    .getByRole("button", { name: "Simuler l’expiration de mon accès" })
    .click();
  await expect(page.getByText("Inactive", { exact: true })).toBeVisible();
  expect((await context.request.get("/api/lessons/l001")).status()).toBe(403);
  expect((await context.request.get("/api/club")).status()).toBe(403);
  await page.goto("/cours/l001");
  await expect(
    page.getByText(/Votre accès est inactif ou a expiré/),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Le cours écrit", exact: true }),
  ).toHaveCount(0);
  await page.goto("/espace");
  await expect(page.getByTestId("completed-count")).toHaveText("1 / 132");
});
test("les offres sans Club et les accès éditoriaux sont contrôlés sur le serveur", async ({
  page,
  context,
}) => {
  await register(page, "scope-check@example.test");
  expect(
    (await api(context.request, "/api/demo", { plan: "flexible" })).status(),
  ).toBe(200);
  expect((await context.request.get("/api/club")).status()).toBe(403);
  expect((await context.request.get("/api/admin")).status()).toBe(403);
  expect(
    (
      await api(context.request, "/api/admin", {
        action: "threshold",
        threshold: 1,
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await context.request.post("/api/demo", {
        data: { plan: "mensuel" },
        headers: { origin: "https://untrusted.example" },
      })
    ).status(),
  ).toBe(403);
  expect(
    (await api(context.request, "/api/demo", { plan: "essai" })).status(),
  ).toBe(200);
  expect((await context.request.get("/api/lessons/l013")).status()).toBe(403);
});
test("édition protégée, persistance du cours, publication et modération du Club", async ({
  page,
  context,
}) => {
  const email = "editor-check@example.test";
  await register(page, email);
  const db = new DatabaseSync(process.env.TEST_DATABASE_PATH!);
  db.prepare("UPDATE users SET role='admin' WHERE email=?").run(email);
  db.close();
  await page.goto("/admin");
  await page.getByLabel("Choisir la leçon").selectOption("l002");
  await expect(
    page.getByRole("textbox", { name: /Le cours écrit/ }),
  ).toHaveValue("");
  await page
    .getByRole("textbox", { name: /Le cours écrit/ })
    .fill(
      'Texte de vérification persistant.\n\n## Un intertitre\n\n<script>alert("xss")</script>',
    );
  await page.getByLabel("Publier le cours pour les élèves autorisés").check();
  await page
    .getByRole("button", { name: "Enregistrer la leçon", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("enregistrées");
  await page.reload();
  await page.getByLabel("Choisir la leçon").selectOption("l002");
  await expect(
    page.getByRole("textbox", { name: /Le cours écrit/ }),
  ).toHaveValue(/Texte de vérification persistant\./);
  await page.goto("/cours/l002");
  await expect(
    page.getByText('<script>alert("xss")</script>', { exact: true }),
  ).toBeVisible();
  await api(context.request, "/api/demo", { plan: "mensuel" });
  await page.goto("/club");
  await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Enregistré", exact: true }),
  ).toBeVisible();
  await page
    .getByText("Échanger sur cette publication", { exact: true })
    .click();
  await page.getByLabel("Votre commentaire").fill("Une question de test.");
  await page.getByRole("button", { name: "Publier mon commentaire" }).click();
  await expect(
    page.getByText("Une question de test.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Signaler", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Signalement transmis");
  await page.goto("/admin");
  await page
    .getByRole("button", { name: "Club et modération", exact: true })
    .click();
  await expect(
    page.getByText("Bienvenue dans le Club IA · 1 signalement(s)", {
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByLabel("Titre", { exact: true })
    .fill("Publication de vérification");
  await page
    .getByLabel("Texte", { exact: true })
    .fill("Un contenu de démonstration à vérifier.");
  await page
    .getByRole("button", { name: "Enregistrer la publication", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("enregistrées");
  expect(
    JSON.stringify(await (await context.request.get("/api/club")).json()),
  ).not.toContain("Publication de vérification");
  await page
    .locator(".admin-list-row")
    .filter({ hasText: "Publication de vérification" })
    .getByRole("button", { name: "Modifier", exact: true })
    .click();
  await page.getByLabel("Publier maintenant dans le Club").check();
  await page
    .getByRole("button", { name: "Enregistrer la publication", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("enregistrées");
  expect(
    JSON.stringify(await (await context.request.get("/api/club")).json()),
  ).toContain("Publication de vérification");
});
test("une session est révoquée après déconnexion", async ({
  page,
  context,
}) => {
  await register(page, "logout-check@example.test");
  await page
    .getByRole("button", { name: "Se déconnecter", exact: true })
    .click();
  await expect(page).toHaveURL("/");
  expect((await context.request.get("/api/lessons/l001")).status()).toBe(401);
  await page.goto("/espace");
  await expect(page).toHaveURL(/\/connexion$/);
});
