import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionTitle } from "@/components/public/section-title";
import { Card } from "@/components/shared/card";
import { storage } from "@/lib/storage";
import { formatDate } from "@/lib/utils/date";
import { getDocumentById } from "@/features/documents/service";

export default async function DocumentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const document = await getDocumentById(id).catch(() => null);

  if (!document || document.status !== "PUBLISHED") {
    notFound();
  }

  const isTextFile = document.mimeType.startsWith("text/");

  let textContent: string | null = null;
  if (isTextFile) {
    const buffer = await storage.readFile(document.filePath).catch(() => null);
    if (buffer) {
      textContent = buffer.toString("utf8");
    }
  }

  return (
    <div className="space-y-6">
      <SectionTitle title={document.title} description={document.description} />

      <Card className="space-y-3">
        <p className="text-xs text-slate-500">
          Категория: {document.category} | Версия: {document.version} | Дата публикации: {formatDate(document.publishedAt)} | Скачиваний:{" "}
          {document.downloadsCount}
        </p>

        {textContent ? (
          <article className="whitespace-pre-line rounded-md bg-slate-50 p-4 leading-relaxed text-slate-700">
            {textContent}
          </article>
        ) : (
          <p className="text-sm text-slate-700">
            Для этого типа файла предпросмотр недоступен. Используйте кнопку «Скачать файл».
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/api/documents/${document.id}/download`}
            target="_blank"
            className="inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Скачать файл
          </Link>
          <Link href="/documents" className="text-sm font-medium text-slate-700 hover:underline">
            Назад к документам
          </Link>
        </div>
      </Card>
    </div>
  );
}

