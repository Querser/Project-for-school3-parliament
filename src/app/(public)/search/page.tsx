import Link from "next/link";

import { SectionTitle } from "@/components/public/section-title";
import { Card } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/shared/input";
import { Select } from "@/components/shared/select";
import { globalSearchSchema } from "@/lib/validators/search";
import { runGlobalSearch } from "@/features/search/service";

const scopeOptions = [
  { value: "all", label: "Все разделы" },
  { value: "news", label: "Новости" },
  { value: "documents", label: "Документы" },
  { value: "ministries", label: "Министерства" },
  { value: "events", label: "События" },
  { value: "reports", label: "Отчеты" },
  { value: "achievements", label: "Достижения" },
] as const;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; scope?: string }>;
}) {
  const params = await searchParams;

  const parsed = globalSearchSchema.safeParse({
    q: params.q ?? "",
    scope: params.scope ?? "all",
  });

  const hasQuery = Boolean(params.q && params.q.trim().length >= 2);

  const results = parsed.success ? await runGlobalSearch(parsed.data.q, parsed.data.scope).catch(() => null) : null;

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Глобальный поиск"
        description="Поиск по новостям, документам, министерствам, событиям, отчетам и достижениям."
      />

      <Card>
        <form className="grid gap-3 md:grid-cols-[1fr_220px_auto]" method="get">
          <Input name="q" placeholder="Введите запрос" defaultValue={params.q ?? ""} />
          <Select name="scope" defaultValue={parsed.success ? parsed.data.scope : "all"}>
            {scopeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
            Найти
          </button>
        </form>
      </Card>

      {!hasQuery ? (
        <EmptyState title="Введите запрос" description="Минимум 2 символа для выполнения поиска." />
      ) : !parsed.success ? (
        <EmptyState title="Некорректный запрос" description={parsed.error.issues[0]?.message ?? "Проверьте параметры поиска."} />
      ) : !results ? (
        <EmptyState title="Ошибка поиска" description="Попробуйте повторить запрос позже." />
      ) : (
        <div className="space-y-4">
          {results.news.length > 0 ? (
            <Card className="space-y-2">
              <h2 className="text-lg font-semibold text-slate-900">Новости</h2>
              {results.news.map((item) => (
                <p key={item.id} className="text-sm text-slate-700">
                  <Link href={`/news/${item.slug}`} className="font-semibold text-slate-800 hover:underline">
                    {item.title}
                  </Link>
                </p>
              ))}
            </Card>
          ) : null}

          {results.documents.length > 0 ? (
            <Card className="space-y-2">
              <h2 className="text-lg font-semibold text-slate-900">Документы</h2>
              {results.documents.map((item) => (
                <p key={item.id} className="text-sm text-slate-700">
                  <Link href={`/documents/${item.id}`} className="font-semibold text-slate-800 hover:underline">
                    {item.title}
                  </Link>
                </p>
              ))}
            </Card>
          ) : null}

          {results.ministries.length > 0 ? (
            <Card className="space-y-2">
              <h2 className="text-lg font-semibold text-slate-900">Министерства</h2>
              {results.ministries.map((item) => (
                <p key={item.id} className="text-sm text-slate-700">
                  <Link href={`/ministries/${item.slug}`} className="font-semibold text-slate-800 hover:underline">
                    {item.name}
                  </Link>
                </p>
              ))}
            </Card>
          ) : null}

          {results.events.length > 0 ? (
            <Card className="space-y-2">
              <h2 className="text-lg font-semibold text-slate-900">События</h2>
              {results.events.map((item) => (
                <p key={item.id} className="text-sm text-slate-700">
                  <Link href={`/events/${item.slug}`} className="font-semibold text-slate-800 hover:underline">
                    {item.title}
                  </Link>
                </p>
              ))}
            </Card>
          ) : null}

          {results.reports.length > 0 ? (
            <Card className="space-y-2">
              <h2 className="text-lg font-semibold text-slate-900">Отчеты</h2>
              {results.reports.map((item) => (
                <p key={item.id} className="text-sm text-slate-700">
                  <Link href={`/reports/${item.slug}`} className="font-semibold text-slate-800 hover:underline">
                    {item.title}
                  </Link>
                </p>
              ))}
            </Card>
          ) : null}

          {results.achievements.length > 0 ? (
            <Card className="space-y-2">
              <h2 className="text-lg font-semibold text-slate-900">Достижения</h2>
              {results.achievements.map((item) => (
                <p key={item.id} className="text-sm text-slate-700">
                  {item.title}
                </p>
              ))}
            </Card>
          ) : null}

          {results.news.length === 0 &&
          results.documents.length === 0 &&
          results.ministries.length === 0 &&
          results.events.length === 0 &&
          results.reports.length === 0 &&
          results.achievements.length === 0 ? (
            <EmptyState title="Ничего не найдено" description="Попробуйте изменить формулировку запроса или выбрать другой раздел." />
          ) : null}
        </div>
      )}
    </div>
  );
}

