import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/shared/badge";
import { Card } from "@/components/shared/card";
import { requireSectionAccess } from "@/lib/auth/session";
import { formatDate } from "@/lib/utils/date";
import { getAdminRoleLabel } from "@/lib/utils/status";
import { prisma } from "@/lib/db/prisma";
import { getObservabilityOverview, getTrafficOverview } from "@/features/observability/service";

export default async function AdminObservabilityPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  await requireSectionAccess("observability");

  const { days } = await searchParams;
  const resolvedDays = Math.max(1, Math.min(90, Number(days ?? 30) || 30));

  const [overview, traffic, activeSessions] = await Promise.all([
    getObservabilityOverview(resolvedDays).catch(() => null),
    getTrafficOverview(resolvedDays).catch(() => null),
    prisma.adminSession.findMany({
      where: {
        revokedAt: null,
        endedAt: null,
      },
      include: {
        adminUser: true,
      },
      orderBy: [{ startedAt: "desc" }],
      take: 30,
    }).catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <AdminPageHeader
          title="Наблюдаемость"
          description="Логи, аудит, события безопасности, телеметрия и сессии администраторов."
        />
        <form className="flex items-center gap-2">
          <label className="text-sm text-slate-700" htmlFor="days">Период (дней)</label>
          <input id="days" name="days" type="number" min={1} max={90} defaultValue={resolvedDays} className="h-9 w-24 rounded-md border border-slate-300 px-2 text-sm" />
          <button type="submit" className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700">Обновить</button>
        </form>
      </div>

      {overview ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Card>
            <p className="text-sm text-slate-600">Журнал приложения</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{overview.counters.totalLogs}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-600">Аудит-события</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{overview.counters.totalAudit}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-600">События безопасности</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{overview.counters.totalSecurity}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-600">События телеметрии</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{overview.counters.totalTelemetry}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-600">Ошибки</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{overview.counters.errorLogs}</p>
          </Card>
        </section>
      ) : null}

      {traffic ? (
        <section className="grid gap-4 md:grid-cols-3">
          <Card className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900">Трафик</h2>
            <p className="text-sm text-slate-700">События: {traffic.totalEvents}</p>
            <p className="text-sm text-slate-700">Уникальные посетители: {traffic.uniqueVisitors}</p>
            <p className="text-sm text-slate-700">Сессии: {traffic.sessions}</p>
            <p className="text-sm text-slate-700">Просмотры страниц: {traffic.pageViews}</p>
          </Card>
          <Card className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900">Вовлеченность</h2>
            <p className="text-sm text-slate-700">Клики CTA идеи: {traffic.ideaCtaClicks}</p>
            <p className="text-sm text-slate-700">Скачивания документов: {traffic.downloads}</p>
          </Card>
          <Card className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900">Контент</h2>
            <p className="text-xs font-medium text-slate-600">Топ новостей:</p>
            {traffic.popularNews.length === 0 ? <p className="text-sm text-slate-600">Нет данных</p> : traffic.popularNews.map((item) => <p key={item.path} className="text-sm text-slate-700">{item.path} ({item.hits})</p>)}
            <p className="mt-2 text-xs font-medium text-slate-600">Топ министерств:</p>
            {traffic.popularMinistries.length === 0 ? <p className="text-sm text-slate-600">Нет данных</p> : traffic.popularMinistries.map((item) => <p key={item.path} className="text-sm text-slate-700">{item.path} ({item.hits})</p>)}
          </Card>
        </section>
      ) : null}

      {overview ? (
        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">Последние логи приложения</h2>
            <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
              {overview.latestLogs.map((item) => (
                <div key={item.id} className="rounded-md border border-slate-200 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={item.severity === "ERROR" || item.severity === "CRITICAL" ? "default" : "muted"}>{item.severity}</Badge>
                    <Badge variant="muted">{item.group}</Badge>
                    <span className="text-xs text-slate-500">{formatDate(item.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{item.message}</p>
                  <p className="text-xs text-slate-500">модуль: {item.module} | путь: {item.path ?? "-"} | requestId: {item.requestId ?? "-"}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">Последние события аудита</h2>
            <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
              {overview.latestAudit.map((item) => (
                <div key={item.id} className="rounded-md border border-slate-200 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="muted">{item.action}</Badge>
                    <Badge variant="muted">{item.module}</Badge>
                    <span className="text-xs text-slate-500">{formatDate(item.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{item.summary}</p>
                  <p className="text-xs text-slate-500">оператор: {item.actorUser?.username ?? "system"} | сущность: {item.entityType}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>
      ) : null}

      {overview ? (
        <Card className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">События безопасности</h2>
          <div className="max-h-[360px] space-y-2 overflow-auto pr-1">
            {overview.latestSecurity.map((item) => (
              <div key={item.id} className="rounded-md border border-slate-200 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={item.success ? "success" : "default"}>{item.eventType}</Badge>
                  <span className="text-xs text-slate-500">{formatDate(item.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm text-slate-700">{item.message}</p>
                <p className="text-xs text-slate-500">пользователь: {item.adminUser?.username ?? item.usernameAttempt ?? "unknown"} | ip: {item.ipAddress ?? "-"}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <Card className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">Активные сессии админов</h2>
        {activeSessions.length === 0 ? (
          <p className="text-sm text-slate-600">Активных сессий нет.</p>
        ) : (
          <div className="space-y-2">
            {activeSessions.map((session) => (
              <div key={session.id} className="rounded-md border border-slate-200 p-3">
                <p className="text-sm font-semibold text-slate-900">{session.adminUser.username}</p>
                <p className="text-xs text-slate-500">роль: {getAdminRoleLabel(session.adminUser.role)} | старт: {formatDate(session.startedAt)} | последняя активность: {formatDate(session.lastActivityAt)}</p>
                <p className="text-xs text-slate-500">ip: {session.ipAddress ?? "-"} | user-agent: {session.userAgent ?? "-"}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}


