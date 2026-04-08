import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionTitle } from "@/components/public/section-title";
import { Card } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { toPublicUploadUrl } from "@/lib/storage";
import { getGalleryAlbumBySlug } from "@/features/gallery/service";

export default async function GalleryAlbumPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const album = await getGalleryAlbumBySlug(slug).catch(() => null);

  if (!album) {
    notFound();
  }

  const images = album.items.filter((item) => item.mediaType.startsWith("image/"));

  return (
    <div className="space-y-6">
      <SectionTitle title={album.title} description={album.description} />

      {images.length === 0 ? (
        <EmptyState title="В альбоме пока нет фотографий" description="Фотографии будут добавлены позже." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {images.map((item) => (
            <Card key={item.id} className="space-y-2">
              <Image
                src={toPublicUploadUrl(item.mediaPath)}
                alt={item.caption ?? album.title}
                width={1200}
                height={700}
                className="h-56 w-full rounded-md object-cover"
              />
              {item.caption ? <p className="text-sm text-slate-600">{item.caption}</p> : null}
            </Card>
          ))}
        </div>
      )}

      <Link href="/gallery" className="inline-flex text-sm font-medium text-slate-700 hover:underline">
        Назад к галерее
      </Link>
    </div>
  );
}

