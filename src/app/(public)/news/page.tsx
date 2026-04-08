import Image from "next/image";
import Link from "next/link";

import { SectionTitle } from "@/components/public/section-title";
import { Badge } from "@/components/shared/badge";
import { Card, CardDescription, CardTitle } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { toPublicUploadUrl } from "@/lib/storage";
import { formatDateTime } from "@/lib/utils/date";
import { getPublishedNews } from "@/features/news/service";

function getExcerpt(content: string): string {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (normalized.length <= 180) {
    return normalized;
  }

  return `${normalized.slice(0, 177)}...`;
}

export default async function NewsPage() {
  const news = await getPublishedNews().catch(() => []);

  return (
    <div className="space-y-6">
      <SectionTitle title="Новости" description="Официальные публикации о деятельности ученического парламента." />

      {news.length === 0 ? (
        <EmptyState
          title="Опубликованных новостей пока нет"
          description="После публикации новостей информация появится в этом разделе."
        />
      ) : (
        <div className="space-y-4">
          {news.map((item) => (
            <Card key={item.id} className="space-y-3">
              {item.coverImagePath ? (
                <Image
                  src={toPublicUploadUrl(item.coverImagePath)}
                  alt={item.title}
                  width={1200}
                  height={700}
                  className="h-56 w-full rounded-md object-cover"
                />
              ) : null}
              <CardTitle>{item.title}</CardTitle>
              <p className="text-xs text-slate-500">
                Дата публикации: {formatDateTime(item.publishedAt)}
                {item.category ? ` | Категория: ${item.category.name}` : ""}
              </p>
              {item.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag.tag.id} variant="muted">
                      {tag.tag.name}
                    </Badge>
                  ))}
                </div>
              ) : null}
              <CardDescription>{getExcerpt(item.content)}</CardDescription>
              <Link href={`/news/${item.slug}`} className="text-sm font-semibold text-slate-800 hover:underline">
                Читать полностью
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
