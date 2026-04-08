import Link from "next/link";

import { ActionMessage } from "@/components/admin/action-message";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { Input } from "@/components/shared/input";
import { Select } from "@/components/shared/select";
import { Textarea } from "@/components/shared/textarea";
import { getGalleryAlbumById } from "@/features/gallery/service";
import { prisma } from "@/lib/db/prisma";
import { toPublicUploadUrl } from "@/lib/storage";
import { toDateInputValue } from "@/lib/utils/date";

import {
  addGalleryItemAction,
  deleteGalleryItemAction,
  updateGalleryAlbumAction,
  updateGalleryItemAction,
} from "../actions";

export default async function AdminGalleryEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { id } = await params;
  const { error, success } = await searchParams;

  const [album, events] = await Promise.all([
    getGalleryAlbumById(id),
    prisma.event.findMany({ orderBy: [{ startAt: "desc" }] }).catch(() => []),
  ]);

  if (!album) {
    return (
      <div className="space-y-4">
        <AdminPageHeader title="Альбом не найден" />
        <Link href="/admin/gallery" className="text-sm font-medium text-slate-700 hover:underline">
          Вернуться к списку
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminPageHeader title="Редактирование альбома" description={album.title} />
        <Link href="/admin/gallery" className="text-sm font-medium text-slate-700 hover:underline">
          Назад к списку
        </Link>
      </div>

      <ActionMessage error={error} success={success} />

      <form action={updateGalleryAlbumAction.bind(null, album.id)} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Название альбома</span>
          <Input name="title" defaultValue={album.title} required />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Описание</span>
          <Textarea name="description" className="min-h-28" defaultValue={album.description} required />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Статус</span>
            <Select name="status" defaultValue={album.status}>
              <option value="DRAFT">Черновик</option>
              <option value="SCHEDULED">Запланировать</option>
              <option value="PUBLISHED">Опубликовать</option>
              <option value="ARCHIVED">Архив</option>
            </Select>
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Дата публикации</span>
            <Input name="publishedAt" type="date" defaultValue={toDateInputValue(album.publishedAt)} />
          </label>
        </div>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Связанное событие</span>
          <Select name="eventId" defaultValue={album.eventId ?? ""}>
            <option value="">Не выбрано</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </Select>
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Новая обложка</span>
          <Input name="coverImage" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" />
        </label>

        <Button type="submit">Сохранить изменения</Button>
      </form>

      <Card className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Добавить фотографию</h2>
        <form action={addGalleryItemAction.bind(null, album.id)} className="space-y-3">
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Файл</span>
            <Input name="media" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" required />
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block space-y-1 text-sm">
              <span className="font-medium text-slate-700">Описание</span>
              <Input name="caption" />
            </label>
            <label className="block space-y-1 text-sm">
              <span className="font-medium text-slate-700">Порядок</span>
              <Input name="sortOrder" type="number" min={0} defaultValue={0} />
            </label>
          </div>
          <Button type="submit">Добавить фотографию</Button>
        </form>
      </Card>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">Фотографии альбома</h2>
        {album.items.length === 0 ? (
          <p className="text-sm text-slate-600">Фотографий пока нет.</p>
        ) : (
          <div className="space-y-2">
            {album.items.map((item) => (
              <Card key={item.id} className="space-y-3">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">{item.mediaType}</p>
                  <Link href={toPublicUploadUrl(item.mediaPath)} target="_blank" className="text-xs font-semibold text-slate-800 hover:underline">
                    Открыть файл
                  </Link>
                </div>

                <form action={updateGalleryItemAction.bind(null, album.id, item.id)} className="grid gap-3 md:grid-cols-[1fr_140px_auto]">
                  <Input name="caption" defaultValue={item.caption ?? ""} placeholder="Описание фотографии" />
                  <Input name="sortOrder" type="number" min={0} defaultValue={item.sortOrder} />
                  <Button type="submit" size="sm" variant="outline">
                    Сохранить
                  </Button>
                </form>

                <form action={deleteGalleryItemAction.bind(null, album.id, item.id)}>
                  <Button type="submit" variant="danger" size="sm">
                    Удалить
                  </Button>
                </form>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}


