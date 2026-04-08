import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionTitle } from "@/components/public/section-title";
import { Card } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils/date";
import { getInitiativeStatusLabel } from "@/lib/utils/status";
import { getMinistryBySlug } from "@/features/ministries/service";

export default async function MinistryDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ministry = await getMinistryBySlug(slug).catch(() => null);

  if (!ministry) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <SectionTitle title={ministry.name} description={ministry.shortDescription} />

      <Card className="space-y-4">
        <p className="leading-relaxed text-slate-700">{ministry.fullDescription}</p>
        {ministry.ministerMember ? (
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-800">Ответственный министр:</span> {ministry.ministerMember.fullName}
          </p>
        ) : null}
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-slate-900">Состав министерства</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {ministry.members.length === 0 ? (
            <li>Состав пока не заполнен.</li>
          ) : (
            ministry.members.map((member) => <li key={member.id}>{member.fullName} - {member.positionTitle}</li>)
          )}
        </ul>
      </Card>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">Текущие инициативы</h2>
        {ministry.initiatives.length === 0 ? (
          <EmptyState title="Инициатив пока нет" description="После назначения инициатив они появятся в этом разделе." />
        ) : (
          <div className="space-y-2">
            {ministry.initiatives.map((item) => (
              <Card key={item.id} className="space-y-1">
                <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.description}</p>
                <p className="text-xs text-slate-500">Статус: {getInitiativeStatusLabel(item.status)}</p>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">Связанные новости</h2>
        {ministry.news.length === 0 ? (
          <EmptyState title="Новостей пока нет" description="Публикации министерства появятся в этом разделе." />
        ) : (
          <div className="space-y-2">
            {ministry.news.map((item) => (
              <Card key={item.id} className="space-y-1">
                <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.summary}</p>
                <p className="text-xs text-slate-500">{formatDate(item.publishedAt)}</p>
                <Link href={`/news/${item.slug}`} className="text-sm font-semibold text-slate-800 hover:underline">
                  Читать новость
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">Отчеты министерства</h2>
        {ministry.reports.length === 0 ? (
          <EmptyState title="Отчетов пока нет" description="После публикации отчеты появятся в этом разделе." />
        ) : (
          <div className="space-y-2">
            {ministry.reports.map((report) => (
              <Card key={report.id} className="space-y-1">
                <h3 className="text-base font-semibold text-slate-900">{report.title}</h3>
                <p className="text-sm text-slate-600">{report.summary}</p>
                <p className="text-xs text-slate-500">Период: {report.periodLabel}</p>
                <Link href={`/reports/${report.slug}`} className="text-sm font-semibold text-slate-800 hover:underline">
                  Открыть отчет
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
