import Link from "next/link";

import { ActionMessage } from "@/components/admin/action-message";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { Textarea } from "@/components/shared/textarea";

import { createDocumentAction } from "../actions";

export default async function AdminDocumentsNewPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminPageHeader title="Новый документ" description="Загрузите файл и заполните метаданные." />
        <Link href="/admin/documents" className="text-sm font-medium text-slate-700 hover:underline">
          Назад к списку
        </Link>
      </div>

      <ActionMessage error={error} success={success} />

      <form action={createDocumentAction} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Название документа</span>
          <Input name="title" required />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Описание</span>
          <Textarea name="description" required />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Категория</span>
            <Input name="category" required placeholder="Конституция / Регламент / Протокол" />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Дата публикации</span>
            <Input name="publishedAt" type="date" required />
          </label>
        </div>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Файл</span>
          <Input
            type="file"
            name="file"
            required
            accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          />
        </label>

        <Button type="submit">Сохранить документ</Button>
      </form>
    </div>
  );
}
