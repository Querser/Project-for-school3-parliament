import Link from "next/link";

import { ActionMessage } from "@/components/admin/action-message";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { Select } from "@/components/shared/select";
import { Textarea } from "@/components/shared/textarea";
import { getAchievementById } from "@/features/achievements/service";
import { prisma } from "@/lib/db/prisma";
import { toDateInputValue } from "@/lib/utils/date";

import { updateAchievementAction } from "../actions";

export default async function AdminAchievementEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { id } = await params;
  const { error, success } = await searchParams;

  const [achievement, ministries] = await Promise.all([
    getAchievementById(id),
    prisma.ministry.findMany({ orderBy: [{ displayOrder: "asc" }, { name: "asc" }] }).catch(() => []),
  ]);

  if (!achievement) {
    return (
      <div className="space-y-4">
        <AdminPageHeader title="Достижение не найдено" />
        <Link href="/admin/achievements" className="text-sm font-medium text-slate-700 hover:underline">
          Вернуться к списку
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminPageHeader title="Редактирование достижения" description={achievement.title} />
        <Link href="/admin/achievements" className="text-sm font-medium text-slate-700 hover:underline">
          Назад к списку
        </Link>
      </div>

      <ActionMessage error={error} success={success} />

      <form action={updateAchievementAction.bind(null, achievement.id)} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Название</span>
          <Input name="title" defaultValue={achievement.title} required />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Полный текст</span>
          <Textarea name="content" className="min-h-32" defaultValue={achievement.content} required />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Эффект</span>
          <Input name="impact" defaultValue={achievement.impact ?? ""} />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Статус</span>
            <Select name="status" defaultValue={achievement.status}>
              <option value="DRAFT">Черновик</option>
              <option value="PUBLISHED">Опубликовано</option>
            </Select>
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Дата публикации</span>
            <Input name="publishedAt" type="date" defaultValue={toDateInputValue(achievement.publishedAt)} />
          </label>
        </div>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Министерство</span>
          <Select name="ministryId" defaultValue={achievement.ministryId ?? ""}>
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


