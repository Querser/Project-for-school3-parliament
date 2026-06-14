import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionTitle } from "@/components/public/section-title";
import { Badge } from "@/components/shared/badge";
import { Card } from "@/components/shared/card";
import { toPublicUploadUrl } from "@/lib/storage";
import { formatDateTime } from "@/lib/utils/date";
import { getNewsBySlug } from "@/features/news/service";

export default async function NewsDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const news = await getNewsBySlug(slug).catch(() => null);

  if (!news) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <SectionTitle title={news.title} />
      <Card className="space-y-3">
        {news.coverImagePath ? (
          <Image
            src={toPublicUploadUrl(news.coverImagePath)}
            alt={news.title}
            width={1200}
            height={700}
            className="h-64 w-full rounded-md object-cover"
          />
        ) : null}
        <p className="text-xs text-slate-500">
          Дата публикации: {formatDateTime(news.publishedAt)}
          {news.category ? ` | Категория: ${news.category.name}` : ""}
          {news.ministry ? ` | Министерство: ${news.ministry.name}` : ""}
        </p>
        {news.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {news.tags.map((tag) => (
              <Badge key={tag.tag.id} variant="muted">
                {tag.tag.name}
              </Badge>
            ))}
          </div>
        ) : null}
        <article className="whitespace-pre-line leading-relaxed text-slate-700">{news.content}</article>
      </Card>

      <Link href="/news" className="inline-flex text-sm font-medium text-slate-700 hover:underline">
        Ко всем новостям
      </Link>
    </div>
  );
}

