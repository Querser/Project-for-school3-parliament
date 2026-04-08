import Link from "next/link";

import { ActionMessage } from "@/components/admin/action-message";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { Select } from "@/components/shared/select";
import { Textarea } from "@/components/shared/textarea";
import { prisma } from "@/lib/db/prisma";

import { createGalleryAlbumAction } from "../actions";

export default async function AdminGalleryNewPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const events = await prisma.event.findMany({ orderBy: [{ startAt: "desc" }] }).catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminPageHeader title="Новый альбом" description="Создайте альбом и загрузите обложку." />
        <Link href="/admin/gallery" className="text-sm font-medium text-slate-700 hover:underline">
          Назад к списку
        </Link>
      </div>

      <ActionMessage error={error} success={success} />

      <form action={createGalleryAlbumAction} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Название альбома</span>
          <Input name="title" required />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Описание</span>
          <Textarea name="description" className="min-h-28" required />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Статус</span>
            <Select name="status" defaultValue="DRAFT">
              <option value="DRAFT">Черновик</option>
              <option value="SCHEDULED">Запланировать</option>
              <option value="PUBLISHED">Опубликовать</option>
              <option value="ARCHIVED">Архив</option>
            </Select>
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Дата публикации</span>
            <Input name="publishedAt" type="date" />
          </label>
        </div>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Связанное событие</span>
          <Select name="eventId" defaultValue="">
            <option value="">Не выбрано</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </Select>
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Обложка (опционально)</span>
          <Input name="coverImage" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" />
        </label>

        <Button type="submit">Сохранить альбом</Button>
      </form>
    </div>
  );
}


