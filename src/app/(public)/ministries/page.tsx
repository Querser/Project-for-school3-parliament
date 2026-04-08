import Link from "next/link";

import { SectionTitle } from "@/components/public/section-title";
import { Card, CardDescription, CardTitle } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { getMinistriesPublicList } from "@/features/ministries/service";

export default async function MinistriesPage() {
  const ministries = await getMinistriesPublicList().catch(() => []);

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Министерства"
        description="Структура министерств, ответственные направления и текущие проекты."
      />

      {ministries.length === 0 ? (
        <EmptyState
          title="Министерства пока не опубликованы"
          description="После обновления структуры парламента раздел будет дополнен."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {ministries.map((ministry) => (
            <Card key={ministry.id} className="space-y-3">
              <CardTitle>{ministry.name}</CardTitle>
              <CardDescription>{ministry.shortDescription}</CardDescription>
              {ministry.ministerMember ? <p className="text-sm text-slate-600">Министр: {ministry.ministerMember.fullName}</p> : null}
              <p className="text-xs text-slate-500">
                Новости: {ministry._count.news} | Отчеты: {ministry._count.reports} | Инициативы: {ministry._count.initiatives}
              </p>
              <Link href={`/ministries/${ministry.slug}`} className="text-sm font-semibold text-slate-800 hover:underline">
                Открыть страницу министерства
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
