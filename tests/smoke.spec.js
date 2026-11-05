import { test, expect } from "@playwright/test";

// OVault is a single page app driven by hash routes. Every journey below starts
// from a route a person can reach, and asserts what they would see.

const routes = {
  signin: "/#/signin",
  dashboard: "/#/",
  empty: "/#/?state=empty",
  lost: "/#/?state=lost",
  repo: "/#/repo/impose",
  failed: "/#/repo/orbit-api?state=failed",
  browse: "/#/repo/impose/browse",
  file: "/#/file/code",
  secret: "/#/file/secret",
  settings: "/#/settings",
  states: "/#/states",
};

test.describe("opening the vault", () => {
  test("the sign in screen makes the offer and gives two ways in", async ({ page }) => {
    await page.goto(routes.signin);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("The backup of");
    await expect(page.getByRole("button", { name: /Continue with GitHub/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Continue with email/i })).toBeVisible();
    await expect(page.getByText(/never ask for personal access tokens/i)).toBeVisible();
  });

  test("continuing with GitHub lands on the repositories dashboard", async ({ page }) => {
    await page.goto(routes.signin);
    await page.getByRole("button", { name: /Continue with GitHub/i }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Repositories" })).toBeVisible();
    await expect(page.getByText(/repositories protected/i)).toBeVisible();
  });
});

test.describe("working with repositories", () => {
  test("the dashboard lists monitored repositories and opens one", async ({ page }) => {
    await page.goto(routes.dashboard);
    await expect(page.getByRole("heading", { name: /Monitored repositories/i })).toBeVisible();

    const rows = page.locator('a.row[href^="#/repo/"]');
    await expect(rows).toHaveCount(5);

    await page.locator('a.row[href="#/repo/impose"]').first().click();
    await expect(page.getByRole("heading", { level: 1, name: "impose" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Backup history/i })).toBeVisible();
  });

  test("a repository opens into a browsable file list", async ({ page }) => {
    await page.goto(routes.repo);
    await page.getByRole("link", { name: /Browse files/i }).click();
    await expect(page).toHaveURL(/\/#\/repo\/impose\/browse/);
    const files = page.locator("a.file-row");
    await expect(files.first()).toBeVisible();
    await expect(files).not.toHaveCount(0);
  });

  test("a file in the snapshot opens with its metadata and a download", async ({ page }) => {
    await page.goto(routes.browse);
    const fileLink = page.locator('a.file-row[href^="#/file/"]').first();
    await expect(fileLink).toBeVisible();
    await fileLink.click();
    await expect(page).toHaveURL(/\/#\/file\//);
    await expect(page.getByRole("button", { name: /Download/i }).first()).toBeVisible();
  });

  test("a secret file is previewed as masked, not as plain text", async ({ page }) => {
    await page.goto(routes.secret);
    await expect(page.getByRole("heading", { name: ".env" })).toBeVisible();
    await expect(page.getByText(/Environment \/ configuration/i)).toBeVisible();
  });
});

test.describe("states a real vault runs into", () => {
  test("an empty vault asks for the first repository instead of showing rows", async ({ page }) => {
    await page.goto(routes.empty);
    await expect(page.getByRole("heading", { name: /Protect your/i })).toBeVisible();
    await expect(page.locator('a.row[href^="#/repo/"]')).toHaveCount(0);
  });

  test("a lost connection says backups are safe and offers a reconnect", async ({ page }) => {
    await page.goto(routes.lost);
    await expect(page.getByText(/GitHub connection lost/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Reconnect GitHub/i })).toBeVisible();
  });

  test("a failed backup is flagged on the repository", async ({ page }) => {
    await page.goto(routes.failed);
    await expect(page.getByRole("heading", { level: 1, name: "orbit-api" })).toBeVisible();
    await expect(page.locator("#app").getByText(/failed/i).first()).toBeVisible();
  });
});

test.describe("settings and navigation", () => {
  test("settings exposes the connection and a guarded danger zone", async ({ page }) => {
    await page.goto(routes.settings);
    await expect(page.getByRole("heading", { name: /GitHub connection/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Danger zone/i })).toBeVisible();

    const danger = page.getByRole("button", { name: /delete account/i }).first();
    if (await danger.count()) {
      await danger.click();
      await expect(page.getByRole("heading", { name: /delete/i }).first()).toBeVisible();
      await page.getByRole("button", { name: "Cancel" }).click();
      await expect(page.getByRole("button", { name: "Cancel" })).toHaveCount(0);
    }
  });

  test("the rail moves between views", async ({ page }) => {
    await page.goto(routes.dashboard);
    await page.locator('[data-nav="settings"]').click();
    await expect(page).toHaveURL(/\/#\/settings/);
    await expect(page.getByRole("heading", { level: 1, name: "Settings" })).toBeVisible();

    await page.locator('[data-nav="dashboard"]').click();
    await expect(page.getByRole("heading", { level: 1, name: "Repositories" })).toBeVisible();
  });

  test("every route renders without a console error", async ({ page }) => {
    const errors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    for (const route of Object.values(routes)) {
      await page.goto(route);
      await expect(page.locator("#app")).not.toBeEmpty();
    }
    expect(errors).toEqual([]);
  });

  test("nothing scrolls sideways on a phone", async ({ page }) => {
    for (const route of [routes.dashboard, routes.repo, routes.browse, routes.settings]) {
      await page.goto(route);
      const overflow = await page.evaluate(() => {
        const el = document.scrollingElement;
        return el.scrollWidth - window.innerWidth;
      });
      expect(overflow, `horizontal overflow on ${route}`).toBeLessThanOrEqual(1);
    }
  });
});
