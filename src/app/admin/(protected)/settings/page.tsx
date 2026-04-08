import { ActionMessage } from "@/components/admin/action-message";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { Input } from "@/components/shared/input";
import { Textarea } from "@/components/shared/textarea";
import { requireSectionAccess } from "@/lib/auth/session";
import { DEFAULT_SITE_FULL_NAME, DEFAULT_SITE_SHORT_NAME, OFFICIAL_TELEGRAM_URL, SITE_SETTING_KEYS } from "@/lib/constants";
import { getHomeBlocks, getSiteSettingsMap } from "@/features/settings/service";

import { updateSettingsAction } from "./actions";

type HomeBlockDraft = {
  key: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  displayOrder: number;
  isEnabled: boolean;
};

const defaultSettings: Record<string, string> = {
  [SITE_SETTING_KEYS.siteName]: DEFAULT_SITE_FULL_NAME,
  [SITE_SETTING_KEYS.siteNameShort]: DEFAULT_SITE_SHORT_NAME,
  [SITE_SETTING_KEYS.homeIntroTitle]: "Официальный портал ученического парламента",
  [SITE_SETTING_KEYS.homeIntroText]:
    "Мы объединяем инициативных учеников для развития школьной среды, диалога и реализации полезных проектов.",
  [SITE_SETTING_KEYS.telegramIdeaUrl]: OFFICIAL_TELEGRAM_URL,
  [SITE_SETTING_KEYS.officialTelegram]: OFFICIAL_TELEGRAM_URL,
  [SITE_SETTING_KEYS.privacyNotice]:
    "На сайте используются технические и аналитические данные для улучшения качества работы платформы.",
};

const defaultHomeBlocks: HomeBlockDraft[] = [
  {
    key: "hero_primary",
    title: "Участвуй в развитии школьной жизни",
    description: "Присоединяйся к инициативам парламента и предлагай свои идеи для школы.",
    ctaLabel: "Предложить идею",
    ctaHref: "/initiatives",
    displayOrder: 1,
    isEnabled: true,
  },
  {
    key: "home_documents",
    title: "Официальные документы",
    description: "Конституция, регламенты, протоколы и отчеты в открытом доступе.",
    ctaLabel: "Открыть библиотеку",
    ctaHref: "/documents",
    displayOrder: 2,
    isEnabled: true,
  },
  {
    key: "home_join",
    title: "Стань частью команды",
    description: "Узнай, как попасть в состав парламента и участвовать в проектах.",
    ctaLabel: "Как вступить",
    ctaHref: "/join",
    displayOrder: 3,
    isEnabled: true,
  },
];

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  await requireSectionAccess("settings");

  const { error, success } = await searchParams;

  const [settings, homeBlocks] = await Promise.all([
    getSiteSettingsMap().catch(() => ({} as Record<string, string>)),
    getHomeBlocks().catch(() => []),
  ]);

  const homeBlocksMap = new Map(homeBlocks.map((block) => [block.key, block]));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Настройки сайта"
        description="Брендинг, Telegram-каналы и параметры публичной информации."
      />

      <ActionMessage error={error} success={success} />

      <Card>
        <form action={updateSettingsAction} className="space-y-6">
          <section className="space-y-4">
            <h2 className="text-base font-semibold text-slate-900">Брендинг и главная страница</h2>

            <label className="block space-y-1 text-sm">
              <span className="font-medium text-slate-700">Полное название сайта</span>
              <Input
                name={SITE_SETTING_KEYS.siteName}
                defaultValue={settings[SITE_SETTING_KEYS.siteName] ?? defaultSettings[SITE_SETTING_KEYS.siteName]}
                required
              />
            </label>

            <label className="block space-y-1 text-sm">
              <span className="font-medium text-slate-700">Краткое название сайта</span>
              <Input
                name={SITE_SETTING_KEYS.siteNameShort}
                defaultValue={
                  settings[SITE_SETTING_KEYS.siteNameShort] ?? defaultSettings[SITE_SETTING_KEYS.siteNameShort]
                }
                required
              />
            </label>

            <label className="block space-y-1 text-sm">
              <span className="font-medium text-slate-700">Заголовок на главной</span>
              <Input
                name={SITE_SETTING_KEYS.homeIntroTitle}
                defaultValue={
                  settings[SITE_SETTING_KEYS.homeIntroTitle] ?? defaultSettings[SITE_SETTING_KEYS.homeIntroTitle]
                }
                required
              />
            </label>

            <label className="block space-y-1 text-sm">
              <span className="font-medium text-slate-700">Вводный текст на главной</span>
              <Textarea
                name={SITE_SETTING_KEYS.homeIntroText}
                defaultValue={
                  settings[SITE_SETTING_KEYS.homeIntroText] ?? defaultSettings[SITE_SETTING_KEYS.homeIntroText]
                }
                required
                className="min-h-28"
              />
            </label>
          </section>

          <section className="space-y-4 border-t border-slate-200 pt-4">
            <h2 className="text-base font-semibold text-slate-900">Главные блоки (Home Blocks)</h2>
            <p className="text-sm text-slate-600">Управление карточками быстрых ссылок на главной странице.</p>

            <div className="space-y-4">
              {defaultHomeBlocks.map((fallbackBlock) => {
                const block = homeBlocksMap.get(fallbackBlock.key) ?? fallbackBlock;

                return (
                  <div key={fallbackBlock.key} className="rounded-lg border border-slate-200 p-4">
                    <input type="hidden" name="homeBlockKey" value={fallbackBlock.key} />

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="block space-y-1 text-sm">
                        <span className="font-medium text-slate-700">Заголовок</span>
                        <Input name={`homeBlock:${fallbackBlock.key}:title`} defaultValue={block.title} required />
                      </label>

                      <label className="block space-y-1 text-sm">
                        <span className="font-medium text-slate-700">Порядок</span>
                        <Input
                          type="number"
                          name={`homeBlock:${fallbackBlock.key}:displayOrder`}
                          defaultValue={String(block.displayOrder)}
                          min={0}
                          required
                        />
                      </label>
                    </div>

                    <label className="mt-4 block space-y-1 text-sm">
                      <span className="font-medium text-slate-700">Описание</span>
                      <Textarea
                        name={`homeBlock:${fallbackBlock.key}:description`}
                        defaultValue={block.description}
                        className="min-h-20"
                        required
                      />
                    </label>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <label className="block space-y-1 text-sm">
                        <span className="font-medium text-slate-700">Текст кнопки</span>
                        <Input name={`homeBlock:${fallbackBlock.key}:ctaLabel`} defaultValue={block.ctaLabel ?? ""} />
                      </label>

                      <label className="block space-y-1 text-sm">
                        <span className="font-medium text-slate-700">Ссылка кнопки</span>
                        <Input name={`homeBlock:${fallbackBlock.key}:ctaHref`} defaultValue={block.ctaHref ?? ""} />
                      </label>
                    </div>

                    <label className="mt-4 inline-flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        name={`homeBlock:${fallbackBlock.key}:isEnabled`}
                        className="h-4 w-4"
                        defaultChecked={block.isEnabled}
                      />
                      Показывать блок на главной
                    </label>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="space-y-4 border-t border-slate-200 pt-4">
            <h2 className="text-base font-semibold text-slate-900">Контакты и каналы связи</h2>

            <label className="block space-y-1 text-sm">
              <span className="font-medium text-slate-700">Telegram для отправки идей</span>
              <Input
                name={SITE_SETTING_KEYS.telegramIdeaUrl}
                defaultValue={OFFICIAL_TELEGRAM_URL}
                readOnly
              />
            </label>

            <label className="block space-y-1 text-sm">
              <span className="font-medium text-slate-700">Официальный Telegram</span>
              <Input
                name={SITE_SETTING_KEYS.officialTelegram}
                defaultValue={OFFICIAL_TELEGRAM_URL}
                readOnly
              />
            </label>
            <p className="text-sm text-slate-600">
              Адрес для страницы контактов: Московская область, г. Можайск, улица Полосухина, 3А
            </p>
          </section>

          <section className="space-y-4 border-t border-slate-200 pt-4">
            <h2 className="text-base font-semibold text-slate-900">Приватность и аналитика</h2>

            <label className="block space-y-1 text-sm">
              <span className="font-medium text-slate-700">Текст уведомления о сборе аналитики</span>
              <Textarea
                name={SITE_SETTING_KEYS.privacyNotice}
                defaultValue={
                  settings[SITE_SETTING_KEYS.privacyNotice] ?? defaultSettings[SITE_SETTING_KEYS.privacyNotice]
                }
                className="min-h-24"
                required
              />
            </label>
          </section>

          <Button type="submit">Сохранить настройки</Button>
        </form>
      </Card>
    </div>
  );
}
