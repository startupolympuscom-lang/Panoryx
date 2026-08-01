import { test, expect } from "@playwright/test";

/**
 * Smoke test for the authentication → PanoStation access flow.
 *
 * This suite runs against a build with placeholder Supabase credentials
 * (see .env.local / .env.example), so it exercises everything that doesn't
 * require a live database: middleware route protection, the `next` redirect
 * parameter, and that the auth forms render correctly. Once real Supabase
 * credentials are configured, extend this file with a full
 * signup → confirm → login → dashboard round trip.
 */

test.describe("Authentication → PanoStation access", () => {
  test("unauthenticated visitors are redirected to login with a next param", async ({ page }) => {
    await page.goto("/app/panostation");
    await expect(page).toHaveURL(/\/connexion\?next=%2Fapp%2Fpanostation/);
    await expect(page.getByRole("heading", { name: "Connexion à Panoryx" })).toBeVisible();
  });

  test("the PanoStation product page links to the protected app route", async ({ page }) => {
    await page.goto("/produits/panostation");
    const accessLink = page.getByRole("link", { name: "Accéder à PanoStation" }).first();
    await expect(accessLink).toHaveAttribute("href", "/app/panostation");

    await accessLink.click();
    await expect(page).toHaveURL(/\/connexion\?next=%2Fapp%2Fpanostation/);
  });

  test("login page exposes accessible email/password fields", async ({ page }) => {
    await page.goto("/connexion");
    await expect(page.getByLabel("Adresse e-mail")).toBeVisible();
    await expect(page.getByLabel("Mot de passe")).toBeVisible();
    await expect(page.getByRole("button", { name: "Se connecter" })).toBeVisible();
  });

  test("signup page collects the fields required to provision an organization", async ({ page }) => {
    await page.goto("/inscription");
    await expect(page.getByLabel("Nom complet")).toBeVisible();
    await expect(page.getByLabel("Nom de l'entreprise")).toBeVisible();
    await expect(page.getByLabel("Adresse e-mail")).toBeVisible();
    await expect(page.getByRole("button", { name: "Créer mon compte" })).toBeVisible();
  });

  test("unauthenticated visitors hitting /app are also redirected", async ({ page }) => {
    await page.goto("/app");
    await expect(page).toHaveURL(/\/connexion\?next=%2Fapp/);
  });
});

test.describe("Marketing site smoke", () => {
  test("home page renders the hero and primary navigation", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Le système d'exploitation des entreprises modernes." })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Panoryx" }).first()).toBeVisible();
  });

  test("product hub lists PanoStation as available", async ({ page }) => {
    await page.goto("/produits");
    await expect(page.getByRole("heading", { name: "PanoStation" })).toBeVisible();
  });
});
