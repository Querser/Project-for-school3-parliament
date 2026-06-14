import Link from "next/link";

import { ActionMessage } from "@/components/admin/action-message";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { Select } from "@/components/shared/select";
import { Textarea } from "@/components/shared/textarea";
import { getNewsById, getNewsMetaOptions } from "@/features/news/service";
import { IMAGE_UPLOAD_ACCEPT } from "@/lib/constants";
import { toDateTimeInputValue } from "@/lib/utils/date";

import { updateNewsAction } from "../actions";

export default async function AdminNewsEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { id } = await params;
  const { error, success } = await searchParams;
  const [news, meta] = await Promise.all([
    getNewsById(id),
    getNewsMetaOptions().catch(() => ({ categories: [], ministries: [], tags: [] })),
  ]);

  if (!news) {
    return (
      <div className="space-y-4">
        <AdminPageHeader title="Новость не найдена" />
        <Link href="/admin/news" className="text-sm font-medium text-slate-700 hover:underline">
          Вернуться к списку
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminPageHeader title="Редактирование новости" description={news.title} />
        <Link href="/admin/news" className="text-sm font-medium text-slate-700 hover:underline">
          Назад к списку
        </Link>
      </div>

      <ActionMessage error={error} success={success} />

      <form action={updateNewsAction.bind(null, news.id)} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Заголовок</span>
          <Input name="title" defaultValue={news.title} required />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Полный текст</span>
          <Textarea name="content" defaultValue={news.content} required className="min-h-40" />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Статус</span>
            <Select name="status" defaultValue={news.status}>
              <option value="DRAFT">Черновик</option>
              <option value="SCHEDULED">Запланировать</option>
              <option value="PUBLISHED">Опубликовать</option>
              <option value="ARCHIVED">Архив</option>
            </Select>
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Дата и время публикации</span>
            <Input name="publishedAt" type="datetime-local" defaultValue={toDateTimeInputValue(news.publishedAt)} />
          </label>
        </div>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Дата и время плановой публикации</span>
          <Input name="scheduledAt" type="datetime-local" defaultValue={toDateTimeInputValue(news.scheduledAt)} />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Категория</span>
            <Select name="categoryId" defaultValue={news.categoryId ?? ""}>
              <option value="">Не выбрано</option>
              {meta.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Министерство</span>
            <Select name="ministryId" defaultValue={news.ministryId ?? ""}>
              <option value="">Не выбрано</option>
              {meta.ministries.map((ministry) => (
                <option key={ministry.id} value={ministry.id}>
                  {ministry.name}
                </option>
              ))}
            </Select>
          </label>
        </div>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Теги (через запятую)</span>
          <Input name="tags" defaultValue={news.tags.map((tag) => tag.tag.name).join(", ")} />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Новая обложка (опционально)</span>
          <Input type="file" name="coverImage" accept={IMAGE_UPLOAD_ACCEPT} />
        </label>

        {news.coverImagePath ? (
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="removeCover" className="h-4 w-4" />
            Удалить текущую обложку
          </label>
        ) : null}

        <Button type="submit">Сохранить изменения</Button>
      </form>
    </div>
  );
}


