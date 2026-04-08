import Link from "next/link";

import { ActionMessage } from "@/components/admin/action-message";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { Textarea } from "@/components/shared/textarea";
import { toDateInputValue } from "@/lib/utils/date";
import { getDocumentById } from "@/features/documents/service";

import { updateDocumentAction } from "../actions";

export default async function AdminDocumentsEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { id } = await params;
  const { error, success } = await searchParams;
  const document = await getDocumentById(id);

  if (!document) {
    return (
      <div className="space-y-4">
        <AdminPageHeader title="Документ не найден" />
        <Link href="/admin/documents" className="text-sm font-medium text-slate-700 hover:underline">
          Вернуться к списку
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminPageHeader title="Редактирование документа" description={document.title} />
        <Link href="/admin/documents" className="text-sm font-medium text-slate-700 hover:underline">
          Назад к списку
        </Link>
      </div>

      <ActionMessage error={error} success={success} />

      <form
        action={updateDocumentAction.bind(null, document.id)}
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-6"
      >
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Название документа</span>
          <Input name="title" defaultValue={document.title} required />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Описание</span>
          <Textarea name="description" defaultValue={document.description} required />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Категория</span>
            <Input name="category" defaultValue={document.category} required />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Дата публикации</span>
            <Input name="publishedAt" type="date" defaultValue={toDateInputValue(document.publishedAt)} required />
          </label>
        </div>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Заменить файл (опционально)</span>
          <Input
            type="file"
            name="file"
            accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          />
        </label>

        <Button type="submit">Сохранить изменения</Button>
      </form>
    </div>
  );
}
