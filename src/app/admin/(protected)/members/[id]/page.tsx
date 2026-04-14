import Link from "next/link";

import { ActionMessage } from "@/components/admin/action-message";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { Select } from "@/components/shared/select";
import { Textarea } from "@/components/shared/textarea";
import { getMemberById } from "@/features/members/service";
import { getMinistriesPublicList } from "@/features/ministries/service";
import { requireSectionAccess } from "@/lib/auth/session";
import { IMAGE_UPLOAD_ACCEPT } from "@/lib/constants";

import { updateMemberAction } from "../actions";

export default async function AdminMemberEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  await requireSectionAccess("members");

  const { id } = await params;
  const { error, success } = await searchParams;

  const [member, ministries] = await Promise.all([getMemberById(id), getMinistriesPublicList().catch(() => [])]);

  if (!member) {
    return (
      <div className="space-y-4">
        <AdminPageHeader title="Участник не найден" />
        <Link href="/admin/members" className="text-sm font-medium text-slate-700 hover:underline">
          Вернуться к списку
        </Link>
      </div>
    );
  }

  const memberMinistryIds = new Set(member.ministries.map((ministry) => ministry.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminPageHeader title="Редактирование участника" description={member.fullName} />
        <Link href="/admin/members" className="text-sm font-medium text-slate-700 hover:underline">
          Назад к списку
        </Link>
      </div>

      <ActionMessage error={error} success={success} />

      <form
        action={updateMemberAction.bind(null, member.id)}
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-6"
      >
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">ФИО</span>
          <Input name="fullName" defaultValue={member.fullName} required />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Slug</span>
            <Input name="slug" defaultValue={member.slug ?? ""} />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Порядок отображения</span>
            <Input name="displayOrder" type="number" min={0} defaultValue={member.displayOrder} />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Роль</span>
            <Select name="roleType" defaultValue={member.roleType}>
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
                  <input
                    type="checkbox"
                    name="ministryIds"
                    value={ministry.id}
                    className="h-4 w-4 rounded border-slate-300"
                    defaultChecked={memberMinistryIds.has(ministry.id)}
                  />
                  <span>{ministry.name}</span>
                </label>
              ))}
            </div>
          )}
        </fieldset>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Должность</span>
          <Input name="positionTitle" defaultValue={member.positionTitle} required />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Краткое описание обязанностей</span>
          <Textarea name="shortBio" defaultValue={member.shortBio} required />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Новое фото (опционально)</span>
          <Input type="file" name="photo" accept={IMAGE_UPLOAD_ACCEPT} />
        </label>

        {member.photoPath ? (
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="removePhoto" className="h-4 w-4" />
            Удалить текущее фото
          </label>
        ) : null}

        <Button type="submit">Сохранить изменения</Button>
      </form>
    </div>
  );
}
