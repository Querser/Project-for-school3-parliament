import Link from "next/link";

import { ActionMessage } from "@/components/admin/action-message";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/shared/badge";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { getMembersAdminList } from "@/features/members/service";
import { requireSectionAccess } from "@/lib/auth/session";

import { deleteMemberAction } from "./actions";

const roleLabels: Record<string, string> = {
  PRESIDENT: "Президент",
  VICE_PRESIDENT: "Вице-президент",
  DEPUTY: "Депутат",
  MINISTER: "Министр",
};

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  await requireSectionAccess("members");

  const { error, success } = await searchParams;
  const members = await getMembersAdminList().catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <AdminPageHeader title="Состав парламента" description="Управление участниками и ролями." />
        <Link href="/admin/members/new">
          <Button>Добавить участника</Button>
        </Link>
      </div>

      <ActionMessage error={error} success={success} />

      {members.length === 0 ? (
        <EmptyState
          title="Состав пока пуст"
          description="Добавьте участников парламента, чтобы они отображались на публичной странице."
          actionHref="/admin/members/new"
          actionLabel="Добавить участника"
        />
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <Card key={member.id} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900">{member.fullName}</h3>
                  <Badge variant="muted">{roleLabels[member.roleType] ?? member.roleType}</Badge>
                </div>
                <p className="text-sm text-slate-600">{member.positionTitle}</p>
                <p className="text-xs text-slate-500">
                  Порядок: {member.displayOrder}
                  {member.ministries.length > 0
                    ? ` | Министерства: ${member.ministries.map((ministry) => ministry.name).join(", ")}`
                    : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/members/${member.id}`}>
                  <Button variant="outline" size="sm">
                    Редактировать
                  </Button>
                </Link>
                <form action={deleteMemberAction.bind(null, member.id)}>
                  <Button variant="danger" size="sm" type="submit">
                    Удалить
                  </Button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
