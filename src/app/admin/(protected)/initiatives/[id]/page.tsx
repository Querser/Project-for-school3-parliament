import Link from "next/link";

import { ActionMessage } from "@/components/admin/action-message";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { Select } from "@/components/shared/select";
import { Textarea } from "@/components/shared/textarea";
import { getInitiativeById } from "@/features/initiatives/service";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils/date";

import { updateInitiativeAction } from "../actions";

export default async function AdminInitiativeEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { id } = await params;
  const { error, success } = await searchParams;

  const [initiative, ministries, admins] = await Promise.all([
    getInitiativeById(id),
    prisma.ministry.findMany({ orderBy: [{ displayOrder: "asc" }, { name: "asc" }] }).catch(() => []),
    prisma.adminUser.findMany({ where: { status: "ACTIVE" }, orderBy: [{ username: "asc" }] }).catch(() => []),
  ]);

  if (!initiative) {
    return (
      <div className="space-y-4">
        <AdminPageHeader title="Инициатива не найдена" />
        <Link href="/admin/initiatives" className="text-sm font-medium text-slate-700 hover:underline">
          Вернуться к списку
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminPageHeader title="Модерация инициативы" description={initiative.title} />
        <Link href="/admin/initiatives" className="text-sm font-medium text-slate-700 hover:underline">
          Назад к списку
        </Link>
      </div>

      <ActionMessage error={error} success={success} />

      <form
        action={updateInitiativeAction.bind(null, initiative.id)}
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-6"
      >
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Тема</span>
          <Input name="title" defaultValue={initiative.title} required />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Описание</span>
          <Textarea name="description" defaultValue={initiative.description} className="min-h-32" required />
        </label>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Имя автора</span>
            <Input name="submitterName" defaultValue={initiative.submitterName ?? ""} />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Контакт автора</span>
            <Input name="submitterContact" defaultValue={initiative.submitterContact ?? ""} />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Класс</span>
            <Input name="submitterClass" defaultValue={initiative.submitterClass ?? ""} />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Статус</span>
            <Select name="status" defaultValue={initiative.status}>
              <option value="NEW">Новая</option>
              <option value="UNDER_REVIEW">На рассмотрении</option>
              <option value="ACCEPTED">Принята</option>
              <option value="IN_PROGRESS">В работе</option>
              <option value="IMPLEMENTED">Реализована</option>
              <option value="REJECTED">Отклонена</option>
              <option value="ARCHIVED">Архив</option>
            </Select>
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Приоритет</span>
            <Select name="priority" defaultValue={initiative.priority}>
              <option value="LOW">Низкий</option>
              <option value="MEDIUM">Средний</option>
              <option value="HIGH">Высокий</option>
              <option value="CRITICAL">Критический</option>
            </Select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Ответственное министерство</span>
            <Select name="assignedMinistryId" defaultValue={initiative.assignedMinistryId ?? ""}>
              <option value="">Не назначено</option>
              {ministries.map((ministry) => (
                <option key={ministry.id} value={ministry.id}>
                  {ministry.name}
                </option>
              ))}
            </Select>
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Ответственный админ</span>
            <Select name="assignedAdminId" defaultValue={initiative.assignedAdminId ?? ""}>
              <option value="">Не назначен</option>
              {admins.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.username}
                </option>
              ))}
            </Select>
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="isAnonymous" defaultChecked={initiative.isAnonymous} className="h-4 w-4" />
          Скрыть автора (анонимно)
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="publicShowcase" defaultChecked={initiative.publicShowcase} className="h-4 w-4" />
          Публиковать в витрине реализованных инициатив
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Примечание модератора (добавится в историю)</span>
          <Textarea name="moderationNote" className="min-h-24" />
        </label>

        <Button type="submit">Сохранить изменения</Button>
      </form>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">История модерации</h2>
        {initiative.notes.length === 0 ? (
          <p className="text-sm text-slate-600">История пока пуста.</p>
        ) : (
          <div className="space-y-2">
            {initiative.notes.map((note) => (
              <div key={note.id} className="rounded-md border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-700">{note.note}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {note.author ? `Автор: ${note.author.username} | ` : ""}
                  {formatDate(note.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
