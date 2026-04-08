# codex_full_product_master_prompt_school_parliament — разбивка по шагам

## Фаза 1. Аудит и выравнивание с ТЗ
- [x] Проверить структуру репозитория и текущее состояние MVP.
- [x] Сверить `codex_full_product_master_prompt_school_parliament.md` и `.docx`.
- [x] Зафиксировать расхождения и сформировать рабочий чеклист.

## Фаза 2. Домен и данные
- [x] Расширить Prisma-схему под full-scope (news/events/initiatives/reports/gallery/achievements/observability).
- [x] Обновить сидирование реальными демо-данными.
- [ ] Применить схему к локальной БД (выполняется после запуска PostgreSQL).

## Фаза 3. Публичная платформа
- [x] Реализовать публичные разделы: Home, About, Members, Ministries, News, Documents, Events, Initiatives, Reports, Gallery, Achievements, Join, Contact, Search.
- [x] Добавить воронку подачи инициатив через форму + Telegram deeplink.
- [x] Исправить читаемость Telegram-кнопок.

## Фаза 4. Админ-платформа
- [x] Дашборд и расширенное меню модулей.
- [x] CRUD для событий, инициатив, отчетов, галереи, достижений.
- [x] Центр наблюдаемости (логи, аудит, security, telemetry, активные сессии).
- [x] Расширить настройки сайта (контакты, privacy notice, home blocks).
- [x] Расширить редактор статических страниц (about/suggest/join/contact).

## Фаза 5. Наблюдаемость и безопасность
- [x] Correlation/request-id через `proxy.ts`.
- [x] Логирование auth/audit/domain/system событий.
- [x] Телеметрия с API ingest endpoint.
- [x] Сессии администраторов и базовая session intelligence.

## Фаза 6. Качество и сборка
- [x] Исправить типы (`typecheck`) и линт (`eslint`).
- [x] Исправить кодировки файлов до UTF-8 для стабильной prod-сборки.
- [x] Успешно собрать production build (`npm run build`).
- [ ] Прогнать e2e smoke после старта локальной БД.

## Фаза 7. Документация и эксплуатация
- [x] Подготовить обязательный `requirements.txt` (pinned).
- [x] Обновить README и документацию (`docs/*`) под full-scope.
- [ ] Финальная ручная проверка соответствия ТЗ на поднятом локальном стенде.
