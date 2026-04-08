import Link from "next/link";

import { ActionMessage } from "@/components/admin/action-message";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { Select } from "@/components/shared/select";
import { Textarea } from "@/components/shared/textarea";
import { getNewsMetaOptions } from "@/features/news/service";

import { createNewsAction } from "../actions";

export default async function AdminNewsNewPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const { categories, ministries, events, tags } = await getNewsMetaOptions().catch(() => ({
    categories: [],
    ministries: [],
    events: [],
    tags: [],
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminPageHeader title="Новая новость" description="Заполните поля и сохраните запись." />
        <Link href="/admin/news" className="text-sm font-medium text-slate-700 hover:underline">
          Назад к списку
        </Link>
      </div>

      <ActionMessage error={error} success={success} />

      <form action={createNewsAction} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Заголовок</span>
          <Input name="title" required />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Полный текст</span>
          <Textarea name="content" required className="min-h-40" />
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
            <Input name="publishedAt" type="datetime-local" />
          </label>
        </div>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Дата плановой публикации (для статуса «запланировать»)</span>
          <Input name="scheduledAt" type="datetime-local" />
        </label>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Категория</span>
            <Select name="categoryId" defaultValue="">
              <option value="">Не выбрано</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Министерство</span>
            <Select name="ministryId" defaultValue="">
              <option value="">Не выбрано</option>
              {ministries.map((ministry) => (
                <option key={ministry.id} value={ministry.id}>
                  {ministry.name}
                </option>
              ))}
            </Select>
          </label>

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
        </div>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Теги (через запятую)</span>
          <Input name="tags" placeholder={tags.length > 0 ? tags.map((tag) => tag.name).join(", ") : "например: инициативы, мероприятия"} />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Обложка (опционально)</span>
          <Input type="file" name="coverImage" accept="image/png,image/jpeg,image/webp,image/svg+xml" />
        </label>

        <Button type="submit">Сохранить новость</Button>
      </form>
    </div>
  );
}

