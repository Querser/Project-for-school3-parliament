import Link from "next/link";

import { ActionMessage } from "@/components/admin/action-message";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/shared/badge";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateTime } from "@/lib/utils/date";
import { getPublicationStatusLabel } from "@/lib/utils/status";
import { getNewsAdminList } from "@/features/news/service";

import { deleteNewsAction } from "./actions";

function getExcerpt(content: string): string {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (normalized.length <= 160) {
    return normalized;
  }

  return `${normalized.slice(0, 157)}...`;
}

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const news = await getNewsAdminList().catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <AdminPageHeader title="Новости" description="Управление новостями, тегами и датой публикации." />
        <Link href="/admin/news/new">
          <Button>Добавить новость</Button>
        </Link>
      </div>

      <ActionMessage error={error} success={success} />

      {news.length === 0 ? (
        <EmptyState
          title="Новости пока не созданы"
          description="Создайте первую новость, чтобы она появилась на сайте."
          actionHref="/admin/news/new"
          actionLabel="Создать новость"
        />
      ) : (
        <div className="space-y-3">
          {news.map((item) => (
            <Card key={item.id} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                  <Badge variant={item.status === "PUBLISHED" ? "success" : item.status === "SCHEDULED" ? "default" : "muted"}>
                    {getPublicationStatusLabel(item.status)}
                  </Badge>
                  {item.category ? <Badge variant="muted">{item.category.name}</Badge> : null}
                </div>
                <p className="mt-1 text-sm text-slate-600">{getExcerpt(item.content)}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Обновлено: {formatDateTime(item.updatedAt)}
                  {item.publishedAt ? ` | Публикация: ${formatDateTime(item.publishedAt)}` : ""}
                  {item.scheduledAt ? ` | План: ${formatDateTime(item.scheduledAt)}` : ""}
                  {item.ministry ? ` | Министерство: ${item.ministry.name}` : ""}
                  {item.tags.length > 0 ? ` | Теги: ${item.tags.map((tag) => tag.tag.name).join(", ")}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/news/${item.id}`}>
                  <Button variant="outline" size="sm">
                    Редактировать
                  </Button>
                </Link>
                <form action={deleteNewsAction.bind(null, item.id)}>
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


