import Link from "next/link";

import { ActionMessage } from "@/components/admin/action-message";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { Select } from "@/components/shared/select";
import { Textarea } from "@/components/shared/textarea";
import { getMembersAdminList } from "@/features/members/service";

import { createMinistryAction } from "../actions";

export default async function AdminMinistryNewPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const members = await getMembersAdminList().catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminPageHeader title="Новое министерство" description="Заполните карточку министерства." />
        <Link href="/admin/ministries" className="text-sm font-medium text-slate-700 hover:underline">
          Назад к списку
        </Link>
      </div>

      <ActionMessage error={error} success={success} />

      <form action={createMinistryAction} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Название</span>
          <Input name="name" required />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Порядок отображения</span>
          <Input name="displayOrder" type="number" min={0} defaultValue={0} />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Описание</span>
          <Textarea name="description" required className="min-h-32" />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-slate-700">Назначить министра (опционально)</span>
          <Select name="ministerMemberId" defaultValue="">
            <option value="">Не выбрано</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.fullName}
              </option>
            ))}
          </Select>
        </label>

        <Button type="submit">Сохранить министерство</Button>
      </form>
    </div>
  );
}
