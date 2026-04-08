import Link from "next/link";

import { SectionTitle } from "@/components/public/section-title";
import { Card } from "@/components/shared/card";
import { STATIC_PAGE_KEYS } from "@/lib/constants";
import { resolveTelegramUrl } from "@/lib/utils/telegram";
import { getStaticPageByKey } from "@/features/pages/service";
import { getSiteSettingsMap } from "@/features/settings/service";

const defaultJoinContent = [
  "Открыт набор активных учеников, готовых участвовать в разработке и реализации школьных инициатив.",
  "",
  "Подготовьте короткую мотивационную заявку.",
  "Укажите ваш класс, интересующие направления и идеи, которые хотите реализовать.",
  "Передайте заявку куратору ученического самоуправления или напишите в официальный Telegram парламента.",
].join("\n");

export default async function JoinPage() {
  const [pageData, settings] = await Promise.all([
    getStaticPageByKey(STATIC_PAGE_KEYS.join).catch(() => null),
    getSiteSettingsMap().catch(() => ({} as Record<string, string>)),
  ]);

  const telegramUrl = resolveTelegramUrl(settings);

  return (
    <div className="space-y-6">
      <SectionTitle
        title={pageData?.title ?? "Вступить в парламент"}
        description="Узнайте, как стать частью команды ученического парламента."
      />

      <Card className="space-y-3">
        <p className="whitespace-pre-line leading-relaxed text-slate-700">{pageData?.content ?? defaultJoinContent}</p>
        <Link
          href={telegramUrl}
          className="inline-flex text-sm font-semibold text-slate-800 hover:underline"
          target="_blank"
        >
          Связаться через Telegram
        </Link>
      </Card>
    </div>
  );
}

