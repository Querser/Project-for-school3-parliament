import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card } from "@/components/shared/card";
import { getVisibleNavItems } from "@/lib/auth/permissions";
import { requireAdminSession } from "@/lib/auth/session";
import { getDashboardCounters } from "@/features/settings/service";

export default async function AdminDashboardPage() {
  const session = await requireAdminSession();
  const quickLinks = getVisibleNavItems(session.user.role).filter((item) => item.section !== "dashboard");

  const counters = await getDashboardCounters().catch(() => ({
    publishedNews: 0,
    draftNews: 0,
    scheduledNews: 0,
    documents: 0,
    ministries: 0,
    members: 0,
    newInitiatives: 0,
    galleryAlbumsPublished: 0,
    achievementsPublished: 0,
    pendingModeration: 0,
  }));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Дашборд"
        description="Краткий обзор состояния контента, модерации и публикационных потоков."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm text-slate-600">Новости (опубл./черн./запл.)</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {counters.publishedNews} / {counters.draftNews} / {counters.scheduledNews}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-600">Новые инициативы</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{counters.newInitiatives}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-600">Очередь модерации</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{counters.pendingModeration}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-600">Документы</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{counters.documents}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-600">Галерея (опубликовано)</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{counters.galleryAlbumsPublished}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-600">Достижения (опубликовано)</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{counters.achievementsPublished}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-600">Министерства</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{counters.ministries}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-600">Участники</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{counters.members}</p>
        </Card>
      </section>

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            {item.label}
          </Link>
        ))}
      </section>
    </div>
  );
}


