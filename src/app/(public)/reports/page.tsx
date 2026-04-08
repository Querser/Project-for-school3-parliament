import Link from "next/link";

import { SectionTitle } from "@/components/public/section-title";
import { Card } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { toPublicUploadUrl } from "@/lib/storage";
import { formatDate } from "@/lib/utils/date";
import { getPublicReports } from "@/features/reports/service";

export default async function ReportsPage() {
  const reports = await getPublicReports().catch(() => []);

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Отчеты министерств"
        description="Архив периодических отчетов о результатах работы и реализованных задачах."
      />

      {reports.length === 0 ? (
        <EmptyState title="Отчеты пока не опубликованы" description="После публикации отчеты появятся в этом разделе." />
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Card key={report.id} className="space-y-2">
              <h2 className="text-lg font-semibold text-slate-900">{report.title}</h2>
              <p className="text-sm text-slate-600">{report.summary}</p>
              <p className="text-xs text-slate-500">
                Период: {report.periodLabel}
                {report.ministry ? ` | Министерство: ${report.ministry.name}` : ""}
                {` | Опубликовано: ${formatDate(report.publishedAt)}`}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <Link href={`/reports/${report.slug}`} className="font-semibold text-slate-800 hover:underline">
                  Открыть отчет
                </Link>
                {report.filePath ? (
                  <Link href={toPublicUploadUrl(report.filePath)} className="font-medium text-slate-700 hover:underline" target="_blank">
                    Скачать файл
                  </Link>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
