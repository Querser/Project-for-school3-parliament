import Link from "next/link";

import { SectionTitle } from "@/components/public/section-title";
import { Card } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/shared/input";
import { Select } from "@/components/shared/select";
import { formatDate } from "@/lib/utils/date";
import { getPublicDocuments } from "@/features/documents/service";

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const documents = await getPublicDocuments().catch(() => []);

  const categories = Array.from(new Set(documents.map((doc) => doc.category))).sort((a, b) =>
    a.localeCompare(b, "ru"),
  );

  const q = params.q?.trim().toLowerCase() ?? "";
  const category = params.category?.trim() ?? "";

  const filtered = documents.filter((doc) => {
    const matchText =
      q.length === 0 ||
      doc.title.toLowerCase().includes(q) ||
      doc.description.toLowerCase().includes(q) ||
      doc.category.toLowerCase().includes(q);

    const matchCategory = category.length === 0 || doc.category === category;

    return matchText && matchCategory;
  });

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Документы"
        description="Конституция, регламенты, протоколы и решения в едином архиве."
      />

      <Card>
        <form method="get" className="grid gap-3 md:grid-cols-[1fr_260px_auto]">
          <Input name="q" placeholder="Поиск по документам" defaultValue={params.q ?? ""} />
          <Select name="category" defaultValue={category}>
            <option value="">Все категории</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
            Применить
          </button>
        </form>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          title="Документы не найдены"
          description="Измените фильтры поиска или проверьте запрос."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((doc) => (
            <Card key={doc.id} className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{doc.title}</h3>
                <p className="text-sm text-slate-600">{doc.description}</p>
                <p className="text-xs text-slate-500">
                  Категория: {doc.category} | Версия: {doc.version} | Дата публикации: {formatDate(doc.publishedAt)} | Скачиваний: {doc.downloadsCount}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link href={`/documents/${doc.id}`} className="text-sm font-semibold text-slate-800 hover:underline">
                  Открыть документ
                </Link>
                <Link
                  href={`/api/documents/${doc.id}/download`}
                  target="_blank"
                  className="text-sm font-semibold text-slate-700 hover:underline"
                >
                  Скачать файл
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

