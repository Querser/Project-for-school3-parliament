import { SectionTitle } from "@/components/public/section-title";
import { Card } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils/date";
import { getPublicAchievements } from "@/features/achievements/service";

export default async function AchievementsPage() {
  const achievements = await getPublicAchievements().catch(() => []);

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Достижения"
        description="Результаты реализованных инициатив и измеримый вклад в школьную жизнь."
      />

      {achievements.length === 0 ? (
        <EmptyState title="Достижения пока не опубликованы" description="Раздел пополняется по мере реализации проектов." />
      ) : (
        <div className="space-y-3">
          {achievements.map((item) => (
            <Card key={item.id} className="space-y-2">
              <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
              <p className="text-sm text-slate-600">{item.summary}</p>
              <p className="text-sm text-slate-700 whitespace-pre-line">{item.content}</p>
              {item.impact ? <p className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">Эффект: {item.impact}</p> : null}
              <p className="text-xs text-slate-500">
                {item.ministry ? `Министерство: ${item.ministry.name} | ` : ""}Дата публикации: {formatDate(item.publishedAt)}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


