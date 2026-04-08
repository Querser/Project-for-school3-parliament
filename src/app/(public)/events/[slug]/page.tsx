import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionTitle } from "@/components/public/section-title";
import { Card } from "@/components/shared/card";
import { formatDateTime } from "@/lib/utils/date";
import { getEventBySlug } from "@/features/events/service";

export default async function EventDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug).catch(() => null);

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <SectionTitle title={event.title} description={event.description} />

      <Card className="space-y-3">
        <p className="text-sm text-slate-700">Категория: {event.category}</p>
        <p className="text-sm text-slate-700">Дата и время начала: {formatDateTime(event.startAt)}</p>
        {event.endAt ? <p className="text-sm text-slate-700">Дата и время окончания: {formatDateTime(event.endAt)}</p> : null}
        {event.location ? <p className="text-sm text-slate-700">Место: {event.location}</p> : null}
        {event.organizer ? <p className="text-sm text-slate-700">Организатор: {event.organizer}</p> : null}
        {event.ministry ? <p className="text-sm text-slate-700">Ответственное министерство: {event.ministry.name}</p> : null}
      </Card>

      <Link href="/events" className="inline-flex text-sm font-medium text-slate-700 hover:underline">
        Ко всем событиям
      </Link>
    </div>
  );
}

