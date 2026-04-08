import Link from "next/link";

import { InitiativeSubmitForm } from "@/components/public/initiative-submit-form";
import { SectionTitle } from "@/components/public/section-title";
import { Card } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { STATIC_PAGE_KEYS } from "@/lib/constants";
import { formatDate } from "@/lib/utils/date";
import { getInitiativeStatusLabel } from "@/lib/utils/status";
import { resolveTelegramUrl } from "@/lib/utils/telegram";
import { getPublicShowcaseInitiatives } from "@/features/initiatives/service";
import { getStaticPageByKey } from "@/features/pages/service";
import { getSiteSettingsMap } from "@/features/settings/service";

export default async function InitiativesPage() {
  const [showcase, pageData, settings] = await Promise.all([
    getPublicShowcaseInitiatives().catch(() => []),
    getStaticPageByKey(STATIC_PAGE_KEYS.suggestIdea).catch(() => null),
    getSiteSettingsMap().catch(() => ({} as Record<string, string>)),
  ]);

  const telegramUrl = resolveTelegramUrl(settings);

  return (
    <div className="space-y-6">
      <SectionTitle
        title={pageData?.title ?? "Инициативы и идеи"}
        description="Предложите инициативу через форму или воспользуйтесь официальным Telegram-каналом."
      />

      <Card className="space-y-3">
        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
          {pageData?.content ??
            "Опишите проблему, предложенное решение и ожидаемый результат. Чем конкретнее заявка, тем проще ее рассмотреть."}
        </p>
        <Link
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
        >
          Открыть Telegram для отправки идеи
        </Link>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-slate-900">Отправить инициативу</h2>
        <InitiativeSubmitForm />
      </Card>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">Реализованные инициативы</h2>
        {showcase.length === 0 ? (
          <EmptyState
            title="Реализованные инициативы пока не опубликованы"
            description="После утверждения и реализации инициатив информация появится в этом разделе."
          />
        ) : (
          <div className="space-y-3">
            {showcase.map((item) => (
              <Card key={item.id} className="space-y-1">
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.description}</p>
                <p className="text-xs text-slate-500">
                  Статус: {getInitiativeStatusLabel(item.status)}
                  {item.assignedMinistry ? ` | Министерство: ${item.assignedMinistry.name}` : ""}
                  {item.implementedAt ? ` | Реализовано: ${formatDate(item.implementedAt)}` : ""}
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
