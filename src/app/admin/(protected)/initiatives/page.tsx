import Link from "next/link";

import { ActionMessage } from "@/components/admin/action-message";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/shared/badge";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { getInitiativesAdminList } from "@/features/initiatives/service";

import { deleteInitiativeAction } from "./actions";

const statusLabels: Record<string, string> = {
  NEW: "Новая",
  UNDER_REVIEW: "На рассмотрении",
  ACCEPTED: "Принята",
  IN_PROGRESS: "В работе",
  IMPLEMENTED: "Реализована",
  REJECTED: "Отклонена",
  ARCHIVED: "Архив",
};

const priorityLabels: Record<string, string> = {
  LOW: "Низкий",
  MEDIUM: "Средний",
  HIGH: "Высокий",
  CRITICAL: "Критический",
};

export default async function AdminInitiativesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string; status?: string; priority?: string }>;
}) {
  const { error, success, status, priority } = await searchParams;
  const initiatives = await getInitiativesAdminList().catch(() => []);

  const filtered = initiatives.filter((item) => {
    const matchStatus = status ? item.status === status : true;
    const matchPriority = priority ? item.priority === priority : true;
    return matchStatus && matchPriority;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <AdminPageHeader
          title="Центр модерации инициатив"
          description="Управление статусами, приоритетами, ответственными и историей модерации."
        />
        <form className="grid gap-2 md:grid-cols-2">
          <select name="status" defaultValue={status ?? ""} className="h-10 rounded-md border border-slate-300 px-3 text-sm">
            <option value="">Все статусы</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select name="priority" defaultValue={priority ?? ""} className="h-10 rounded-md border border-slate-300 px-3 text-sm">
            <option value="">Все приоритеты</option>
            {Object.entries(priorityLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <Button type="submit" className="md:col-span-2">
            Применить фильтры
          </Button>
        </form>
      </div>

      <ActionMessage error={error} success={success} />

      {filtered.length === 0 ? (
        <EmptyState title="Инициативы не найдены" description="Проверьте фильтры или дождитесь новых заявок." />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <Card key={item.id} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.description}</p>
                <p className="text-xs text-slate-500">
                  Автор: {item.isAnonymous ? "Анонимно" : item.submitterName ?? "Не указано"}
                  {item.submitterClass ? ` | Класс: ${item.submitterClass}` : ""}
                  {item.assignedMinistry ? ` | Министерство: ${item.assignedMinistry.name}` : ""}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant={item.status === "IMPLEMENTED" ? "success" : "muted"}>{statusLabels[item.status]}</Badge>
                  <Badge variant="muted">Приоритет: {priorityLabels[item.priority]}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/initiatives/${item.id}`}>
                  <Button variant="outline" size="sm">
                    Модерировать
                  </Button>
                </Link>
                <form action={deleteInitiativeAction.bind(null, item.id)}>
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


