import Link from "next/link";

import { ActionMessage } from "@/components/admin/action-message";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { Select } from "@/components/shared/select";
import { Textarea } from "@/components/shared/textarea";
import { getMinistriesPublicList } from "@/features/ministries/service";

import { createEventAction } from "../actions";

export default async function AdminEventNewPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const ministries = await getMinistriesPublicList().catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminPageHeader title="Новое событие" description="Добавьте событие в календарь парламента." />
        <Link href="/admin/events" className="text-sm font-medium text-slate-700 hover:underline">
          Назад к списку
        </Link>
      </div>

      <ActionMessage error={error} success={success} />

      <form action={createEventAction} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Название</span>
          <Input name="title" required />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Описание</span>
          <Textarea name="description" className="min-h-32" required />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Категория</span>
            <Input name="category" required />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Организатор</span>
            <Input name="organizer" />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Дата и время начала</span>
            <Input name="startAt" type="datetime-local" required />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Дата и время окончания</span>
            <Input name="endAt" type="datetime-local" />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Локация</span>
            <Input name="location" />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Статус</span>
            <Select name="status" defaultValue="PLANNED">
              <option value="PLANNED">Запланировано</option>
              <option value="COMPLETED">Проведено</option>
              <option value="CANCELLED">Отменено</option>
            </Select>
          </label>
        </div>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Ответственное министерство (опционально)</span>
          <Select name="ministryId" defaultValue="">
            <option value="">Не выбрано</option>
            {ministries.map((ministry) => (
              <option key={ministry.id} value={ministry.id}>
                {ministry.name}
              </option>
            ))}
          </Select>
        </label>

        <Button type="submit">Сохранить событие</Button>
      </form>
    </div>
  );
}

