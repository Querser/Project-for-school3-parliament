import { ActionMessage } from "@/components/admin/action-message";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/shared/badge";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { requireSectionAccess } from "@/lib/auth/session";
import { formatDate } from "@/lib/utils/date";
import { getAccountStatusLabel, getAdminRoleLabel } from "@/lib/utils/status";
import { prisma } from "@/lib/db/prisma";

import { createAdminUserAction, revokeSessionAction, updateAdminUserAction } from "./actions";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  await requireSectionAccess("users");

  const { error, success } = await searchParams;

  const [users, sessions, failedLogins] = await Promise.all([
    prisma.adminUser.findMany({
      include: {
        sessions: {
          where: {
            revokedAt: null,
            endedAt: null,
          },
          orderBy: [{ startedAt: "desc" }],
        },
      },
      orderBy: [{ createdAt: "asc" }],
    }).catch(() => []),
    prisma.adminSession.findMany({
      where: {
        revokedAt: null,
        endedAt: null,
      },
      include: {
        adminUser: true,
      },
      orderBy: [{ startedAt: "desc" }],
    }).catch(() => []),
    prisma.securityEvent.count({ where: { eventType: "LOGIN_FAILURE" } }).catch(() => 0),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Пользователи и доступ"
        description="Роли, статусы, активные сессии и базовый контроль учетных записей админ-панели."
      />

      <ActionMessage error={error} success={success} />

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Создать пользователя</h2>
        <form action={createAdminUserAction} className="grid gap-3 md:grid-cols-2">
          <input name="username" placeholder="Логин" className="h-10 rounded-md border border-slate-300 px-3 text-sm" required />
          <input name="email" placeholder="Email" className="h-10 rounded-md border border-slate-300 px-3 text-sm" type="email" />
          <input name="password" placeholder="Пароль" className="h-10 rounded-md border border-slate-300 px-3 text-sm" type="password" required />
          <select name="role" defaultValue="EDITOR" className="h-10 rounded-md border border-slate-300 px-3 text-sm">
            <option value="CHIEF_ADMIN">Администратор</option>
            <option value="ADMIN">Президент</option>
            <option value="EDITOR">Редактор</option>
            <option value="MINISTRY_EDITOR">Министр</option>
            <option value="ANALYST">Аналитик</option>
          </select>
          <Button type="submit" className="md:col-span-2">Создать пользователя</Button>
        </form>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Пользователи</h2>
        <p className="text-xs text-slate-500">Всего активных сессий: {sessions.length} | Неуспешных входов: {failedLogins}</p>
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="rounded-md border border-slate-200 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-900">{user.username}</p>
                <Badge variant={user.status === "ACTIVE" ? "success" : "muted"}>{getAccountStatusLabel(user.status)}</Badge>
                <Badge variant="muted">{getAdminRoleLabel(user.role)}</Badge>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Email: {user.email ?? "не указан"} | Последний вход: {formatDate(user.lastLoginAt)} | Активных сессий: {user.sessions.length}
              </p>
              <form action={updateAdminUserAction.bind(null, user.id)} className="mt-3 grid gap-2 md:grid-cols-3">
                <select name="role" defaultValue={user.role} className="h-9 rounded-md border border-slate-300 px-2 text-sm">
                  <option value="CHIEF_ADMIN">Администратор</option>
                  <option value="ADMIN">Президент</option>
                  <option value="EDITOR">Редактор</option>
                  <option value="MINISTRY_EDITOR">Министр</option>
                  <option value="ANALYST">Аналитик</option>
                </select>
                <select name="status" defaultValue={user.status} className="h-9 rounded-md border border-slate-300 px-2 text-sm">
                  <option value="ACTIVE">Активен</option>
                  <option value="DISABLED">Отключен</option>
                </select>
                <Button type="submit" size="sm">Сохранить</Button>
              </form>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Активные сессии</h2>
        <div className="space-y-2">
          {sessions.length === 0 ? (
            <p className="text-sm text-slate-600">Активных сессий нет.</p>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className="flex flex-col gap-2 rounded-md border border-slate-200 p-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{session.adminUser.username}</p>
                  <p className="text-xs text-slate-500">
                    Старт: {formatDate(session.startedAt)} | Последняя активность: {formatDate(session.lastActivityAt)}
                  </p>
                  <p className="text-xs text-slate-500">
                    IP: {session.ipAddress ?? "не определен"} | User-Agent: {session.userAgent ?? "не определен"}
                  </p>
                </div>
                <form action={revokeSessionAction.bind(null, session.sessionToken)}>
                  <Button type="submit" size="sm" variant="danger">
                    Отозвать сессию
                  </Button>
                </form>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}


