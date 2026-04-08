import Link from "next/link";

import { SectionTitle } from "@/components/public/section-title";
import { Card } from "@/components/shared/card";
import { STATIC_PAGE_KEYS } from "@/lib/constants";
import { resolveTelegramUrl } from "@/lib/utils/telegram";
import { getStaticPageByKey } from "@/features/pages/service";
import { getSiteSettingsMap } from "@/features/settings/service";

export default async function ContactPage() {
  const [pageData, settings] = await Promise.all([
    getStaticPageByKey(STATIC_PAGE_KEYS.contact).catch(() => null),
    getSiteSettingsMap().catch(() => ({} as Record<string, string>)),
  ]);

  const telegram = resolveTelegramUrl(settings);

  return (
    <div className="space-y-6">
      <SectionTitle title={pageData?.title ?? "Контакты"} description="Каналы связи с ученическим парламентом." />

      <Card className="space-y-3">
        <p className="whitespace-pre-line leading-relaxed text-slate-700">
          {pageData?.content ??
            "Используйте удобный канал связи для предложений, обратной связи и организационных вопросов."}
        </p>
        <p className="text-sm text-slate-700">Адрес: Московская область, г. Можайск, улица Полосухина, 3А</p>
        <p className="text-sm text-slate-700">
          Telegram:{" "}
          <Link href={telegram} target="_blank" className="font-semibold text-slate-800 hover:underline">
            {telegram}
          </Link>
        </p>
      </Card>
    </div>
  );
}

