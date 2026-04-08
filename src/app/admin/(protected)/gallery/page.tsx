import Link from "next/link";

import { ActionMessage } from "@/components/admin/action-message";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/shared/badge";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils/date";
import { getPublicationStatusLabel } from "@/lib/utils/status";
import { getGalleryAdminList } from "@/features/gallery/service";

import { deleteGalleryAlbumAction } from "./actions";

export default async function AdminGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const albums = await getGalleryAdminList().catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <AdminPageHeader title="Галерея" description="Альбомы и фотографии для публичной галереи." />
        <Link href="/admin/gallery/new">
          <Button>Создать альбом</Button>
        </Link>
      </div>

      <ActionMessage error={error} success={success} />

      {albums.length === 0 ? (
        <EmptyState
          title="Альбомов пока нет"
          description="Создайте первый альбом галереи."
          actionHref="/admin/gallery/new"
          actionLabel="Создать альбом"
        />
      ) : (
        <div className="space-y-3">
          {albums.map((album) => (
            <Card key={album.id} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900">{album.title}</h3>
                  <Badge variant={album.status === "PUBLISHED" ? "success" : "muted"}>
                    {getPublicationStatusLabel(album.status)}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-slate-600">{album.description}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Фотографий: {album._count.items}
                  {album.publishedAt ? ` | Публикация: ${formatDate(album.publishedAt)}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/gallery/${album.id}`}>
                  <Button variant="outline" size="sm">
                    Редактировать
                  </Button>
                </Link>
                <form action={deleteGalleryAlbumAction.bind(null, album.id)}>
                  <Button variant="danger" size="sm" type="submit">
                    Удалить
                  </Button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


