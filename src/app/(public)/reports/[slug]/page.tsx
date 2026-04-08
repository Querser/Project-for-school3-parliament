import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionTitle } from "@/components/public/section-title";
import { Card } from "@/components/shared/card";
import { toPublicUploadUrl } from "@/lib/storage";
import { formatDate } from "@/lib/utils/date";
import { getReportBySlug } from "@/features/reports/service";

export default async function ReportDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const report = await getReportBySlug(slug).catch(() => null);

  if (!report) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <SectionTitle title={report.title} description={report.summary} />

      <Card className="space-y-2">
        <p className="text-xs text-slate-500">
          Период: {report.periodLabel}
          {report.ministry ? ` | Министерство: ${report.ministry.name}` : ""}
          {` | Опубликовано: ${formatDate(report.publishedAt)}`}
        </p>
        <article className="whitespace-pre-line leading-relaxed text-slate-700">{report.content}</article>
        <div className="flex items-center gap-3 text-sm">
          {report.filePath ? (
            <Link href={toPublicUploadUrl(report.filePath)} target="_blank" className="font-semibold text-slate-800 hover:underline">
              Скачать вложение
            </Link>
          ) : null}
          <Link href="/reports" className="font-medium text-slate-700 hover:underline">
            Назад к списку отчетов
          </Link>
        </div>
      </Card>
    </div>
  );
}

