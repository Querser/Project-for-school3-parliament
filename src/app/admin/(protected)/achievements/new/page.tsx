import Link from "next/link";

import { ActionMessage } from "@/components/admin/action-message";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { Select } from "@/components/shared/select";
import { Textarea } from "@/components/shared/textarea";
import { prisma } from "@/lib/db/prisma";

import { createAchievementAction } from "../actions";

export default async function AdminAchievementNewPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;

  const ministries = await prisma.ministry.findMany({ orderBy: [{ displayOrder: "asc" }, { name: "asc" }] }).catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminPageHeader title="Новое достижение" description="Добавьте результат реализованной инициативы." />
        <Link href="/admin/achievements" className="text-sm font-medium text-slate-700 hover:underline">
          Назад к списку
        </Link>
      </div>

      <ActionMessage error={error} success={success} />

      <form action={createAchievementAction} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Название</span>
          <Input name="title" required />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Полный текст</span>
          <Textarea name="content" className="min-h-32" required />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Эффект (опционально)</span>
          <Input name="impact" />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Статус</span>
            <Select name="status" defaultValue="DRAFT">
              <option value="DRAFT">Черновик</option>
              <option value="PUBLISHED">Опубликовано</option>
            </Select>
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Дата публикации</span>
            <Input name="publishedAt" type="date" />
          </label>
        </div>

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

        <Button type="submit">Сохранить достижение</Button>
      </form>
    </div>
  );
}

