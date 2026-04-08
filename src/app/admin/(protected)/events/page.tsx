import Link from "next/link";

import { ActionMessage } from "@/components/admin/action-message";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/shared/badge";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateTime } from "@/lib/utils/date";
import { getEventStatusLabel } from "@/lib/utils/status";
import { getEventsAdminList } from "@/features/events/service";

import { deleteEventAction } from "./actions";

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const events = await getEventsAdminList().catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <AdminPageHeader title="События" description="Календарь событий, статусы и привязка к министерствам." />
        <Link href="/admin/events/new">
          <Button>Добавить событие</Button>
        </Link>
      </div>

      <ActionMessage error={error} success={success} />

      {events.length === 0 ? (
        <EmptyState
          title="Событий пока нет"
          description="Создайте первое событие, чтобы оно появилось в календаре."
          actionHref="/admin/events/new"
          actionLabel="Создать событие"
        />
      ) : (
        <div className="space-y-3">
          {events.map((item) => (
            <Card key={item.id} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                  <Badge variant={item.status === "COMPLETED" ? "success" : item.status === "CANCELLED" ? "muted" : "default"}>
                    {getEventStatusLabel(item.status)}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Начало: {formatDateTime(item.startAt)}
                  {item.endAt ? ` | Окончание: ${formatDateTime(item.endAt)}` : ""}
                  {item.ministry ? ` | ${item.ministry.name}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/events/${item.id}`}>
                  <Button variant="outline" size="sm">
                    Редактировать
                  </Button>
                </Link>
                <form action={deleteEventAction.bind(null, item.id)}>
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


