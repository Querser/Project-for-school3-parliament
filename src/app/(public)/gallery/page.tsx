import Image from "next/image";
import Link from "next/link";

import { SectionTitle } from "@/components/public/section-title";
import { Card } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { toPublicUploadUrl } from "@/lib/storage";
import { formatDateTime } from "@/lib/utils/date";
import { getPublicGalleryPhotos } from "@/features/gallery/service";

export default async function GalleryPage() {
  const photos = await getPublicGalleryPhotos().catch(() => []);
  const sourceTypeLabel: Record<string, string> = {
    news: "Новость",
    event: "Событие",
    gallery: "Галерея",
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="Галерея" description="Фотографии из новостей, мероприятий и альбомов ученического парламента." />

      {photos.length === 0 ? (
        <EmptyState title="Галерея пока пуста" description="После публикации материалов они появятся в этом разделе." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <Card key={photo.id} className="space-y-2">
              <Image
                src={toPublicUploadUrl(photo.imagePath)}
                alt={photo.description}
                width={1200}
                height={700}
                className="h-52 w-full rounded-md object-cover"
              />
              <p className="text-sm text-slate-700">{photo.description}</p>
              <p className="text-xs text-slate-500">
                Источник: {sourceTypeLabel[photo.sourceType] ?? "Материал"} В«{photo.sourceTitle}В» | {formatDateTime(photo.publishedAt)}
              </p>
              <Link href={photo.sourceHref} className="text-sm font-semibold text-slate-800 hover:underline">
                Открыть источник
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

