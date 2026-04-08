import Link from "next/link";

import { ActionMessage } from "@/components/admin/action-message";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { Select } from "@/components/shared/select";
import { Textarea } from "@/components/shared/textarea";
import { getEventById } from "@/features/events/service";
import { getMinistriesPublicList } from "@/features/ministries/service";
import { toDateTimeInputValue } from "@/lib/utils/date";

import { updateEventAction } from "../actions";

export default async function AdminEventEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { id } = await params;
  const { error, success } = await searchParams;

  const [event, ministries] = await Promise.all([getEventById(id), getMinistriesPublicList().catch(() => [])]);

  if (!event) {
    return (
      <div className="space-y-4">
        <AdminPageHeader title="Событие не найдено" />
        <Link href="/admin/events" className="text-sm font-medium text-slate-700 hover:underline">
          Вернуться к списку
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminPageHeader title="Редактирование события" description={event.title} />
        <Link href="/admin/events" className="text-sm font-medium text-slate-700 hover:underline">
          Назад к списку
        </Link>
      </div>

      <ActionMessage error={error} success={success} />

      <form action={updateEventAction.bind(null, event.id)} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Название</span>
          <Input name="title" defaultValue={event.title} required />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Описание</span>
          <Textarea name="description" className="min-h-32" defaultValue={event.description} required />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Категория</span>
            <Input name="category" defaultValue={event.category} required />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Организатор</span>
            <Input name="organizer" defaultValue={event.organizer ?? ""} />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Дата и время начала</span>
            <Input name="startAt" type="datetime-local" defaultValue={toDateTimeInputValue(event.startAt)} required />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Дата и время окончания</span>
            <Input name="endAt" type="datetime-local" defaultValue={toDateTimeInputValue(event.endAt)} />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Локация</span>
            <Input name="location" defaultValue={event.location ?? ""} />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Статус</span>
            <Select name="status" defaultValue={event.status}>
              <option value="PLANNED">Запланировано</option>
              <option value="COMPLETED">Проведено</option>
              <option value="CANCELLED">Отменено</option>
            </Select>
          </label>
        </div>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Ответственное министерство</span>
          <Select name="ministryId" defaultValue={event.ministryId ?? ""}>
            <option value="">Не выбрано</option>
            {ministries.map((ministry) => (
              <option key={ministry.id} value={ministry.id}>
                {ministry.name}
              </option>
            ))}
          </Select>
        </label>

        <Button type="submit">Сохранить изменения</Button>
      </form>
    </div>
  );
}


