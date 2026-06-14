import Link from "next/link";

import { SectionTitle } from "@/components/public/section-title";
import { Card, CardDescription, CardTitle } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { SITE_SETTING_KEYS } from "@/lib/constants";
import { formatDate } from "@/lib/utils/date";
import { getPublicAchievements } from "@/features/achievements/service";
import { getMinistriesPublicList } from "@/features/ministries/service";
import { getLatestPublishedNews } from "@/features/news/service";
import { getHomeBlocks, getSiteSettingsMap } from "@/features/settings/service";

function getExcerpt(content: string): string {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (normalized.length <= 140) {
    return normalized;
  }

  return `${normalized.slice(0, 137)}...`;
}

const defaultQuickLinks = [
  {
    key: "documents",
    title: "Официальные документы",
    description: "Конституция, регламенты, протоколы и решения",
    href: "/documents",
  },
  {
    key: "initiatives",
    title: "Подать идею",
    description: "Онлайн-форма и Telegram-канал",
    href: "/initiatives",
  },
  {
    key: "join",
    title: "Вступить в парламент",
    description: "Условия участия и инструкция подачи заявки",
    href: "/join",
  },
];

export default async function HomePage() {
  const [settings, homeBlocks, latestNews, ministries, achievements] = await Promise.all([
    getSiteSettingsMap().catch(() => ({} as Record<string, string>)),
    getHomeBlocks().catch(() => []),
    getLatestPublishedNews(3).catch(() => []),
    getMinistriesPublicList().catch(() => []),
    getPublicAchievements()
      .then((items) => items.slice(0, 3))
      .catch(() => []),
  ]);

  const introTitle = settings[SITE_SETTING_KEYS.homeIntroTitle] ?? "Официальный портал ученического парламента";
  const introText =
    settings[SITE_SETTING_KEYS.homeIntroText] ??
    "Ученический парламент объединяет учеников для развития школьной среды и реализации общественно полезных инициатив.";

  const dynamicQuickLinks = homeBlocks
    .filter((block) => block.isEnabled)
    .map((block) => ({
      key: block.key,
      title: block.title,
      description: block.description,
      href: block.ctaHref ?? "/",
      ctaLabel: block.ctaLabel ?? "Открыть",
    }));

  const quickLinks = dynamicQuickLinks.length > 0 ? dynamicQuickLinks : defaultQuickLinks;

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-slate-200 bg-white p-6 md:p-8">
        <SectionTitle title={introTitle} description={introText} />
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {quickLinks.map((item) => (
            <Link key={item.key} href={item.href} className="rounded-lg border border-slate-200 p-4 hover:bg-slate-50">
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="mt-1 text-sm text-slate-600">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle title="Последние новости" description="Свежие официальные публикации парламента." />

        {latestNews.length === 0 ? (
          <EmptyState
            title="Пока нет опубликованных новостей"
            description="Как только новость будет опубликована, она появится в этом разделе."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {latestNews.map((item) => (
              <Card key={item.id} className="flex h-full flex-col gap-3">
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{getExcerpt(item.content)}</CardDescription>
                <p className="mt-auto text-xs text-slate-500">{formatDate(item.publishedAt)}</p>
                <Link href={`/news/${item.slug}`} className="text-sm font-semibold text-slate-800 hover:underline">
                  Читать полностью
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <SectionTitle title="Министерства" description="Ключевые направления работы парламента." />
        <div className="grid gap-4 md:grid-cols-2">
          {ministries.slice(0, 4).map((ministry) => (
            <Card key={ministry.id} className="space-y-2">
              <CardTitle className="text-base">{ministry.name}</CardTitle>
              <CardDescription>{ministry.shortDescription}</CardDescription>
              <Link href={`/ministries/${ministry.slug}`} className="text-sm font-semibold text-slate-800 hover:underline">
                Страница министерства
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle title="Достижения" description="Результаты реализованных инициатив и их влияние на школу." />
        {achievements.length === 0 ? (
          <EmptyState
            title="Достижения пока не опубликованы"
            description="После публикации достижений информация появится в этом разделе."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {achievements.map((item) => (
              <Card key={item.id} className="space-y-2">
                <CardTitle className="text-base">{item.title}</CardTitle>
                <CardDescription>{item.summary}</CardDescription>
                <p className="text-xs text-slate-500">{formatDate(item.publishedAt)}</p>
                <Link href="/achievements" className="text-sm font-semibold text-slate-800 hover:underline">
                  Смотреть достижения
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-slate-100 p-6">
        <h2 className="text-xl font-semibold text-slate-900">Есть идея для улучшения школьной жизни?</h2>
        <p className="mt-2 text-slate-700">
          Направьте инициативу через онлайн-форму или Telegram. Каждое предложение проходит модерацию и назначается
          ответственному министерству.
        </p>
        <div className="mt-4">
          <Link
            href="/initiatives"
            className="inline-flex rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
          >
            Открыть форму подачи идеи
          </Link>
        </div>
      </section>
    </div>
  );
}


