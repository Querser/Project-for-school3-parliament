# Разбиение по шагам: `codex_master_prompt_school_parliament.md`

## 0. Базовые принципы исполнения
- Весь пользовательский UI и агентские отчеты: на русском языке.
- Идентификаторы кода, имена файлов, ENV-переменные, модели БД: на английском.
- Реализуем строго MVP, без выхода в out-of-scope.
- Работаем по фазам, фиксируем решения и риски в `docs/agent-journal.md`.

## 1. Фаза 0 — Bootstrap репозитория
1. Создать Next.js 15+ проект (App Router, TypeScript strict, Tailwind, ESLint, pnpm).
2. Подключить базовые зависимости (Prisma, Zod, auth, RHF, shadcn/ui, Vitest, Playwright и др.).
3. Создать структуру каталогов:
   - `src/app/(public)`, `src/app/admin`, `src/app/api`
   - `src/components/public`, `src/components/admin`, `src/components/shared`
   - `src/lib/auth`, `src/lib/db`, `src/lib/storage`, `src/lib/validators`, `src/lib/utils`
   - `src/features/*`
   - `prisma`, `tests/e2e`, `tests/unit`, `docs`, `infra/caddy`, `storage`
4. Подготовить skeleton документации.

## 2. Фаза 1 — Архитектура и данные
1. Зафиксировать архитектуру и границы модулей.
2. Описать Prisma schema (AdminUser, Member, Ministry, News, Document, StaticPage, SiteSetting).
3. Создать миграции и seed-данные.
4. Реализовать auth для админа (credentials + session + route protection).
5. Реализовать storage-слой с локальным persistent volume и интерфейсом для будущей S3-замены.

## 3. Фаза 2 — Admin/CMS
1. `/admin/login` + защищённые admin routes.
2. `/admin` dashboard с обязательными счетчиками.
3. CRUD разделы:
   - News
   - Documents (с загрузкой и валидацией файлов)
   - Ministries
   - Members
4. Редактирование статических страниц и настроек:
   - About
   - Suggest Idea
   - Homepage intro blocks
   - Telegram URL

## 4. Фаза 3 — Public сайт
1. Реализовать обязательные маршруты:
   - `/`, `/about`, `/members`, `/ministries`, `/ministries/[slug]`
   - `/news`, `/news/[slug]`, `/documents`, `/suggest-idea`
2. Подтянуть только опубликованный контент для публичной части.
3. На главной автоматически показывать последние опубликованные новости.
4. Сделать адаптивный «официальный» UI (спокойный, строгий, читаемый).

## 5. Фаза 4 — QA и релизная готовность
1. Unit/Integration (Vitest):
   - validators
   - slug/utils
   - auth guards
   - file validation
2. Smoke E2E (Playwright):
   - загрузка ключевых публичных страниц
   - вход в админку
   - базовые CRUD smoke-сценарии
3. Проверки: lint, build, tests, dockerized run.

## 6. Фаза 5 — Финальная приемка
1. Проверить соответствие scope и DoD.
2. Убедиться, что нет out-of-scope фич.
3. Проверить целостность русскоязычного UX.
4. Закрыть и синхронизировать документацию.

## 7. Обязательная документация
- `README.md`
- `docs/architecture.md`
- `docs/data-model.md`
- `docs/routes-and-permissions.md`
- `docs/local-setup.md`
- `docs/deploy-vps.md`
- `docs/testing-and-qa.md`
- `docs/content-management.md`
- `docs/agent-journal.md`

## 8. DoD чек-лист
- Публичные разделы реализованы.
- Админка и авторизация работают.
- CRUD: News/Documents/Ministries/Members работает.
- Редактирование статических страниц и настроек работает.
- Главная подтягивает последние опубликованные новости.
- Suggest Idea использует настраиваемую Telegram-ссылку.
- Адаптивность есть на mobile/desktop.
- Lint/Build/Tests проходят.
- Dockerized запуск проходит.
- Документация полная и согласованная.
