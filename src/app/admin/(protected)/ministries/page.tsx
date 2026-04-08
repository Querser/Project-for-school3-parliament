import Link from "next/link";

import { ActionMessage } from "@/components/admin/action-message";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { getMinistriesAdminList } from "@/features/ministries/service";

import { deleteMinistryAction } from "./actions";

export default async function AdminMinistriesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const ministries = await getMinistriesAdminList().catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <AdminPageHeader title="Министерства" description="Управление структурой и направлениями работы." />
        <Link href="/admin/ministries/new">
          <Button>Добавить министерство</Button>
        </Link>
      </div>

      <ActionMessage error={error} success={success} />

      {ministries.length === 0 ? (
        <EmptyState
          title="Министерства ещё не созданы"
          description="Добавьте первое министерство, чтобы отобразить структуру парламента."
          actionHref="/admin/ministries/new"
          actionLabel="Добавить министерство"
        />
      ) : (
        <div className="space-y-3">
          {ministries.map((ministry) => (
            <Card key={ministry.id} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{ministry.name}</h3>
                <p className="text-sm text-slate-600">{ministry.shortDescription}</p>
                <p className="text-xs text-slate-500">
                  Участников: {ministry._count.members}
                  {ministry.ministerMember ? ` | Министр: ${ministry.ministerMember.fullName}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/ministries/${ministry.id}`}>
                  <Button variant="outline" size="sm">
                    Редактировать
                  </Button>
                </Link>
                <form action={deleteMinistryAction.bind(null, ministry.id)}>
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
