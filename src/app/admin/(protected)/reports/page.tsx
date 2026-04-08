import Link from "next/link";

import { ActionMessage } from "@/components/admin/action-message";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/shared/badge";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils/date";
import { getPublicationStatusLabel } from "@/lib/utils/status";
import { getReportsAdminList } from "@/features/reports/service";

import { deleteReportAction } from "./actions";

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const reports = await getReportsAdminList().catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <AdminPageHeader title="Отчеты" description="Управление отчетами министерств." />
        <Link href="/admin/reports/new">
          <Button>Добавить отчет</Button>
        </Link>
      </div>

      <ActionMessage error={error} success={success} />

      {reports.length === 0 ? (
        <EmptyState
          title="Отчетов пока нет"
          description="Добавьте первый отчет."
          actionHref="/admin/reports/new"
          actionLabel="Создать отчет"
        />
      ) : (
        <div className="space-y-3">
          {reports.map((item) => (
            <Card key={item.id} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                  <Badge variant={item.status === "PUBLISHED" ? "success" : "muted"}>
                    {getPublicationStatusLabel(item.status)}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-slate-600">{item.summary}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Период: {item.periodLabel}
                  {item.ministry ? ` | Министерство: ${item.ministry.name}` : ""}
                  {item.publishedAt ? ` | Публикация: ${formatDate(item.publishedAt)}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/reports/${item.id}`}>
                  <Button variant="outline" size="sm">
                    Редактировать
                  </Button>
                </Link>
                <form action={deleteReportAction.bind(null, item.id)}>
                  <Button variant="danger" size="sm" type="submit">
                    Удалить
                  </Button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


