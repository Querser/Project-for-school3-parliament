# School Parliament Portal — Full Product

Цифровая платформа ученического парламента МОУ СОШ №3 г. Можайска: публичный портал + административная панель + наблюдаемость (логи, аудит, telemetry, security events).

## Технологии
- Next.js 16 (App Router, TypeScript, React 19)
- Prisma ORM + PostgreSQL
- NextAuth (credentials)
- Tailwind CSS 4
- Zod (валидация)
- Vitest + Playwright
- Docker Compose + Caddy

## Реализованный функционал
- Публичные разделы: Home, About, Members, Ministries, News, Documents, Initiatives, Gallery, Achievements, Join, Contact, Search.
- Админ-разделы: dashboard, новости, документы, министерства, состав, инициативы, галерея, достижения, пользователи, настройки, статические страницы, observability center.
- Доступы админ-панели по ролям:
  - `admin` (полный доступ)
  - `president` (все, кроме Users и Наблюдаемости)
  - `minister` (все, кроме Users/Наблюдаемости/Настроек/Страниц/Состава)
- Наблюдаемость: app logs, audit logs, security events, telemetry events, активные админ-сессии.
- Content workflow: draft/scheduled/published/archived для news и publication status для остальных сущностей.

## Структура репозитория
- `src/app` — страницы и API routes
- `src/features` — доменные сервисы
- `src/lib` — auth/db/storage/validators/utils
- `prisma` — схема, миграции, seed
- `PROJECT_DOCUMENTATION.md` — единый канонический документ по архитектуре, запуску и сопровождению
- `infra/caddy` — reverse-proxy конфигурация

## Локальный запуск
1. Установить зависимости:
```bash
npm install
```
2. Подготовить окружение:
```bash
cp .env.example .env
```
3. Запустить PostgreSQL:
```bash
docker compose up -d db
```
4. Сгенерировать Prisma Client и применить схему:
```bash
npm run prisma:generate
npm run db:push
```
5. Заполнить БД demo-данными:
```bash
npm run prisma:seed
```
6. Запустить приложение:
```bash
npm run dev
```

После старта сайт доступен на `http://localhost:3000`.

## Production запуск
Для production-режима используйте:
```bash
npm run prod
```
или по шагам:
```bash
npm run build
npm run start
```

В production пользователи не видят технические stack trace и внутренние сообщения ошибок: для приложения настроены глобальные и сегментные `error.tsx`/`global-error.tsx` fallback-экраны.

### Если БД не поднимается
- Проверьте, что Docker запущен и контейнер `school_parliament_db` в статусе `healthy`:
```bash
docker compose ps
```
- Проверьте `DATABASE_URL` в `.env`. Для docker-compose dev должен использоваться порт `5433`:
`postgresql://school_parliament:school_parliament@localhost:5433/school_parliament?schema=public`
- Если используете локальный PostgreSQL вне Docker, скорректируйте `DATABASE_URL` под ваш host/port и затем снова выполните:
```bash
npm run db:push
npm run prisma:seed
```

## Тестовые аккаунты после seed
- `admin` / `admin12345`
- `president` / `president12345`
- `minister` / `minister12345`

## Privacy и consent
- Публичная политика конфиденциальности: `/privacy-policy`
- В форме `/initiatives` согласие на обработку персональных данных обязательно.
- Отправка инициативы блокируется на клиенте и сервере, если чекбокс не установлен.

## Проверки качества
```bash
npm run typecheck
npm run lint
npm run test:unit
npm run test:e2e:smoke
npm run build
```

## Docker
- dev/prod-like окружение:
```bash
docker compose up --build -d
```

## Переменные окружения
Смотрите `.env.example`:
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `STORAGE_ROOT`
- `MAX_IMAGE_SIZE_MB`
- `MAX_DOCUMENT_SIZE_MB`
- `ADMIN_SEED_USERNAME`
- `ADMIN_SEED_PASSWORD`
- `PRESIDENT_SEED_USERNAME`
- `PRESIDENT_SEED_PASSWORD`
- `MINISTER_SEED_USERNAME`
- `MINISTER_SEED_PASSWORD`
- `AUTH_LOGIN_WINDOW_MINUTES`
- `AUTH_MAX_FAILED_ATTEMPTS_PER_IP`
- `AUTH_MAX_FAILED_ATTEMPTS_PER_USERNAME`
- `MAX_ACTIVE_ADMIN_SESSIONS`

## Документация
- Основная и актуальная документация проекта: [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)
