import Link from "next/link";

import { ActionMessage } from "@/components/admin/action-message";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { Select } from "@/components/shared/select";
import { Textarea } from "@/components/shared/textarea";
import { getMinistriesPublicList } from "@/features/ministries/service";
import { requireSectionAccess } from "@/lib/auth/session";

import { createMemberAction } from "../actions";

export default async function AdminMemberNewPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  await requireSectionAccess("members");

  const { error, success } = await searchParams;
  const ministries = await getMinistriesPublicList().catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminPageHeader title="Новый участник" description="Добавьте участника в структуру парламента." />
        <Link href="/admin/members" className="text-sm font-medium text-slate-700 hover:underline">
          Назад к списку
        </Link>
      </div>

      <ActionMessage error={error} success={success} />

      <form action={createMemberAction} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">ФИО</span>
          <Input name="fullName" required />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Slug (опционально)</span>
            <Input name="slug" />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Порядок отображения</span>
            <Input name="displayOrder" type="number" min={0} defaultValue={0} />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Роль</span>
            <Select name="roleType" defaultValue="DEPUTY">
              <option value="PRESIDENT">Президент</option>
              <option value="VICE_PRESIDENT">Вице-президент</option>
              <option value="DEPUTY">Депутат</option>
              <option value="MINISTER">Министр</option>
            </Select>
          </label>
        </div>

        <fieldset className="space-y-2 rounded-md border border-slate-200 p-3">
          <legend className="px-1 text-sm font-medium text-slate-700">Министерства (можно выбрать несколько)</legend>
          {ministries.length === 0 ? (
            <p className="text-sm text-slate-500">Список министерств пока пуст.</p>
          ) : (
            <div className="grid gap-2 md:grid-cols-2">
              {ministries.map((ministry) => (
                <label key={ministry.id} className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" name="ministryIds" value={ministry.id} className="h-4 w-4 rounded border-slate-300" />
                  <span>{ministry.name}</span>
                </label>
              ))}
            </div>
          )}
        </fieldset>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Должность</span>
          <Input name="positionTitle" required />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Краткое описание обязанностей</span>
          <Textarea name="shortBio" required />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Фото (опционально)</span>
          <Input type="file" name="photo" accept="image/png,image/jpeg,image/webp" />
        </label>

        <Button type="submit">Сохранить участника</Button>
      </form>
    </div>
  );
}
