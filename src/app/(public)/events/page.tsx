import Link from "next/link";

import { SectionTitle } from "@/components/public/section-title";
import { Badge } from "@/components/shared/badge";
import { Card } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateTime } from "@/lib/utils/date";
import { getEventStatusLabel } from "@/lib/utils/status";
import { getPublicEvents } from "@/features/events/service";

export default async function EventsPage() {
  const events = await getPublicEvents().catch(() => []);

  return (
    <div className="space-y-6">
      <SectionTitle
        title="События и календарь"
        description="Календарь мероприятий ученического парламента: запланированные и проведенные события."
      />

      {events.length === 0 ? (
        <EmptyState
          title="События пока не опубликованы"
          description="После публикации мероприятий информация появится в календаре."
        />
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <Card key={event.id} className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-900">{event.title}</h2>
                <Badge variant={event.status === "CANCELLED" ? "muted" : event.status === "COMPLETED" ? "success" : "default"}>
                  {getEventStatusLabel(event.status)}
                </Badge>
              </div>
              <p className="text-sm text-slate-600">{event.description}</p>
              <p className="text-xs text-slate-500">
                Начало: {formatDateTime(event.startAt)}
                {event.endAt ? ` | Окончание: ${formatDateTime(event.endAt)}` : ""}
                {event.location ? ` | Место: ${event.location}` : ""}
                {event.category ? ` | Категория: ${event.category}` : ""}
              </p>
              <div className="text-sm">
                <Link href={`/events/${event.slug}`} className="font-semibold text-slate-800 hover:underline">
                  Открыть страницу события
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

