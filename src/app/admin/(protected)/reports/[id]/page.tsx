import Link from "next/link";

import { ActionMessage } from "@/components/admin/action-message";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { Select } from "@/components/shared/select";
import { Textarea } from "@/components/shared/textarea";
import { getReportById } from "@/features/reports/service";
import { prisma } from "@/lib/db/prisma";
import { toDateInputValue } from "@/lib/utils/date";

import { updateReportAction } from "../actions";

export default async function AdminReportEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { id } = await params;
  const { error, success } = await searchParams;

  const [report, ministries] = await Promise.all([
    getReportById(id),
    prisma.ministry.findMany({ orderBy: [{ displayOrder: "asc" }, { name: "asc" }] }).catch(() => []),
  ]);

  if (!report) {
    return (
      <div className="space-y-4">
        <AdminPageHeader title="Отчет не найден" />
        <Link href="/admin/reports" className="text-sm font-medium text-slate-700 hover:underline">
          Вернуться к списку
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminPageHeader title="Редактирование отчета" description={report.title} />
        <Link href="/admin/reports" className="text-sm font-medium text-slate-700 hover:underline">
          Назад к списку
        </Link>
      </div>

      <ActionMessage error={error} success={success} />

      <form action={updateReportAction.bind(null, report.id)} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Название</span>
          <Input name="title" defaultValue={report.title} required />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Период</span>
          <Input name="periodLabel" defaultValue={report.periodLabel} required />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Текст отчета</span>
          <Textarea name="content" className="min-h-40" defaultValue={report.content} required />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Статус</span>
            <Select name="status" defaultValue={report.status}>
              <option value="DRAFT">Черновик</option>
              <option value="SCHEDULED">Запланировать</option>
              <option value="PUBLISHED">Опубликовать</option>
              <option value="ARCHIVED">Архив</option>
            </Select>
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Дата публикации</span>
            <Input name="publishedAt" type="date" defaultValue={toDateInputValue(report.publishedAt)} />
          </label>
        </div>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Министерство</span>
          <Select name="ministryId" defaultValue={report.ministryId ?? ""}>
            <option value="">Не выбрано</option>
            {ministries.map((ministry) => (
              <option key={ministry.id} value={ministry.id}>
                {ministry.name}
              </option>
            ))}
          </Select>
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Заменить файл отчета</span>
          <Input name="file" type="file" accept=".pdf,.doc,.docx,.txt" />
        </label>

        <Button type="submit">Сохранить изменения</Button>
      </form>
    </div>
  );
}


