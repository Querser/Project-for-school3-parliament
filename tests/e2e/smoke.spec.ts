import { expect, test } from "@playwright/test";

const adminUsername = process.env.ADMIN_SEED_USERNAME ?? "admin";
const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? "admin12345";
const presidentUsername = process.env.PRESIDENT_SEED_USERNAME ?? "president";
const presidentPassword = process.env.PRESIDENT_SEED_PASSWORD ?? "president12345";
const ministerUsername = process.env.MINISTER_SEED_USERNAME ?? "minister";
const ministerPassword = process.env.MINISTER_SEED_PASSWORD ?? "minister12345";

async function login(
  page: import("@playwright/test").Page,
  username = adminUsername,
  password = adminPassword,
) {
  await page.goto("/admin/login");
  await page.getByLabel("Логин").fill(username);
  await page.getByLabel("Пароль").fill(password);
  await page.getByRole("button", { name: "Войти" }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 20_000 });
}

async function logout(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: "Выйти" }).click();
  await expect(page).toHaveURL(/\/admin\/login(?:\?.*)?$/, { timeout: 20_000 });
}

test.describe.serial("Smoke flows", () => {
  const id = Date.now();
  const newsTitle = `Автотест новость ${id}`;
  const newsTitleUpdated = `${newsTitle} (обновлено)`;
  const ministryName = `Автотест министерство ${id}`;
  const ministryNameUpdated = `${ministryName} (обновлено)`;
  const documentTitle = `Автотест документ ${id}`;
  const albumTitle = `Т${String(id % 1000).padStart(3, "0")}`;
  const albumTitleUpdated = `${albumTitle}a`;

  test("public pages load", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Последние новости")).toBeVisible();

    await page.goto("/news");
    await expect(page.getByRole("heading", { name: "Новости" })).toBeVisible();

    const firstNewsLink = page.locator('a[href^="/news/"]').first();
    if ((await firstNewsLink.count()) > 0) {
      const href = await firstNewsLink.getAttribute("href");
      if (href) {
        await page.goto(href);
        await expect(page).toHaveURL(/\/news\//);
      }
    }

    await page.goto("/ministries");
    await expect(page.getByRole("heading", { name: "Министерства", exact: true })).toBeVisible();

    const firstMinistryLink = page.locator('a[href^="/ministries/"]').first();
    if ((await firstMinistryLink.count()) > 0) {
      const href = await firstMinistryLink.getAttribute("href");
      if (href) {
        await page.goto(href);
        await expect(page).toHaveURL(/\/ministries\//);
      }
    }

    await page.goto("/documents");
    await expect(page.getByRole("heading", { name: "Документы", exact: true })).toBeVisible();
  });

  test("admin login and news CRUD", async ({ page }) => {
    await login(page);

    await page.goto("/admin/news/new");
    await page.getByLabel("Заголовок").fill(newsTitle);
    await page.getByLabel("Полный текст").fill("Полный текст новости для smoke-теста, достаточный по длине.");
    await page.getByRole("combobox", { name: /^Статус$/ }).selectOption("PUBLISHED");
    await page.getByLabel("Дата публикации").fill("2026-04-01T10:30");
    await Promise.all([
      page.waitForURL(/\/admin\/news(?:\?.*)?$/, { timeout: 20_000 }),
      page.getByRole("button", { name: "Сохранить новость" }).click(),
    ]);

    await expect(page).toHaveURL(/\/admin\/news(?:\?.*)?$/);
    await expect(page.getByText(newsTitle)).toBeVisible({ timeout: 15_000 });

    const newsCard = page
      .getByRole("heading", { name: newsTitle })
      .locator("xpath=ancestor::div[contains(@class,'rounded-lg')][1]");
    await newsCard.getByRole("link", { name: "Редактировать" }).click();

    await page.getByLabel("Заголовок").fill(newsTitleUpdated);
    await Promise.all([
      page.waitForURL(/\/admin\/news(?:\?.*)?$/, { timeout: 20_000 }),
      page.getByRole("button", { name: "Сохранить изменения" }).click(),
    ]);
    await expect(page).toHaveURL(/\/admin\/news(?:\?.*)?$/);
    await expect(page.getByText(newsTitleUpdated).or(page.getByText(newsTitle)).first()).toBeVisible({ timeout: 15_000 });

    await page.goto("/news");
    await expect(page.getByText(newsTitleUpdated).or(page.getByText(newsTitle)).first()).toBeVisible({ timeout: 15_000 });
  });

  test("admin ministry CRUD", async ({ page }) => {
    await login(page);

    await page.goto("/admin/ministries/new");
    await page.getByLabel("Название").fill(ministryName);
    await page.getByLabel("Описание").fill("Описание министерства для smoke-теста.");
    await Promise.all([
      page.waitForURL(/\/admin\/ministries(?:\?.*)?$/, { timeout: 20_000 }),
      page.getByRole("button", { name: "Сохранить министерство" }).click(),
    ]);

    await expect(page).toHaveURL(/\/admin\/ministries(?:\?.*)?$/);
    await expect(page.getByText(ministryName)).toBeVisible();

    const ministryCard = page
      .getByRole("heading", { name: ministryName })
      .locator("xpath=ancestor::div[contains(@class,'rounded-lg')][1]");
    await ministryCard.getByRole("link", { name: "Редактировать" }).click();
    await page.getByLabel("Название").fill(ministryNameUpdated);
    await Promise.all([
      page.waitForURL(/\/admin\/ministries(?:\?.*)?$/, { timeout: 20_000 }),
      page.getByRole("button", { name: "Сохранить изменения" }).click(),
    ]);

    await expect(page).toHaveURL(/\/admin\/ministries(?:\?.*)?$/);
    await expect(page.getByText(ministryNameUpdated)).toBeVisible();
  });

  test("admin document upload and metadata edit", async ({ page }) => {
    await login(page);

    await page.goto("/admin/documents/new");
    await page.getByLabel("Название документа").fill(documentTitle);
    await page.getByLabel("Описание").fill("Описание документа для smoke-теста.");
    await page.getByLabel("Категория").fill("Протокол");
    await page.getByLabel("Дата публикации").fill("2026-04-02");

    await page
      .getByLabel("Файл")
      .setInputFiles({
        name: "smoke.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("Smoke document content"),
      });

    await Promise.all([
      page.waitForURL(/\/admin\/documents(?:\?.*)?$/, { timeout: 20_000 }),
      page.getByRole("button", { name: "Сохранить документ" }).click(),
    ]);

    await expect(page).toHaveURL(/\/admin\/documents(?:\?.*)?$/);
    await expect(page.getByText(documentTitle)).toBeVisible();

    const documentCard = page
      .getByRole("heading", { name: documentTitle })
      .locator("xpath=ancestor::div[contains(@class,'rounded-lg')][1]");
    await documentCard.getByRole("link", { name: "Редактировать" }).click();

    await page.getByLabel("Описание").fill("Обновленное описание документа.");
    await Promise.all([
      page.waitForURL(/\/admin\/documents(?:\?.*)?$/, { timeout: 20_000 }),
      page.getByRole("button", { name: "Сохранить изменения" }).click(),
    ]);

    await expect(page).toHaveURL(/\/admin\/documents(?:\?.*)?$/);
    await expect(page.getByText("Обновленное описание документа.").first()).toBeVisible();
  });

  test("admin gallery album CRUD supports short title", async ({ page }) => {
    await login(page);

    await page.goto("/admin/gallery/new");
    await page.getByLabel("Название альбома").fill(albumTitle);
    await page.locator('textarea[name="description"]').fill("Фото");
    await Promise.all([
      page.waitForURL(/\/admin\/gallery(?:\?.*)?$/, { timeout: 20_000 }),
      page.getByRole("button", { name: "Сохранить альбом" }).click(),
    ]);

    await expect(page).toHaveURL(/\/admin\/gallery(?:\?.*)?$/);
    await expect(page.getByRole("heading", { name: albumTitle }).first()).toBeVisible();

    const albumCard = page
      .getByRole("heading", { name: albumTitle })
      .first()
      .locator("xpath=ancestor::div[contains(@class,'rounded-lg')][1]");

    await albumCard.getByRole("link", { name: "Редактировать" }).click();
    await page.getByLabel("Название альбома").fill(albumTitleUpdated);
    await page.locator('textarea[name="description"]').fill("Фото обновлено");
    await Promise.all([
      page.waitForURL(/\/admin\/gallery(?:\?.*)?$/, { timeout: 20_000 }),
      page.getByRole("button", { name: "Сохранить изменения" }).click(),
    ]);

    await expect(page).toHaveURL(/\/admin\/gallery(?:\?.*)?$/);
    await expect(page.getByRole("heading", { name: albumTitleUpdated }).first()).toBeVisible();

    const updatedAlbumCard = page
      .getByRole("heading", { name: albumTitleUpdated })
      .first()
      .locator("xpath=ancestor::div[contains(@class,'rounded-lg')][1]");

    await updatedAlbumCard.getByRole("button", { name: "Удалить" }).click();
    await expect(page.getByRole("heading", { name: albumTitleUpdated })).toHaveCount(0);
  });

  test("role switching keeps permissions consistent", async ({ page }) => {
    await login(page, adminUsername, adminPassword);

    const usersLinkAdmin = page.getByRole("link", { name: "Пользователи" }).first();
    const observabilityLinkAdmin = page.getByRole("link", { name: "Наблюдаемость" }).first();
    await expect(usersLinkAdmin).toBeVisible();
    await expect(observabilityLinkAdmin).toBeVisible();

    await usersLinkAdmin.click();
    await expect(page).toHaveURL(/\/admin\/users(?:\?.*)?$/);
    await page.goto("/admin");

    await observabilityLinkAdmin.click();
    await expect(page).toHaveURL(/\/admin\/observability(?:\?.*)?$/);
    await logout(page);

    await login(page, presidentUsername, presidentPassword);
    await expect(page.getByRole("link", { name: "Пользователи" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Наблюдаемость" })).toHaveCount(0);
    await page.goto("/admin/users");
    await expect(page).toHaveURL(/\/admin(?:\?.*)?$/);
    await page.goto("/admin/observability");
    await expect(page).toHaveURL(/\/admin(?:\?.*)?$/);
    await logout(page);

    await login(page, ministerUsername, ministerPassword);
    await expect(page.getByRole("link", { name: "Пользователи" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Наблюдаемость" })).toHaveCount(0);
    await page.goto("/admin/users");
    await expect(page).toHaveURL(/\/admin(?:\?.*)?$/);
    await page.goto("/admin/observability");
    await expect(page).toHaveURL(/\/admin(?:\?.*)?$/);
    await logout(page);

    await login(page, adminUsername, adminPassword);
    await expect(page.getByRole("link", { name: "Пользователи" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Наблюдаемость" }).first()).toBeVisible();
  });
});

