import type { Prisma, PublicationStatus } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { generateUniqueSlug } from "@/lib/utils/slug";
import type { GalleryAlbumInput, GalleryItemInput } from "@/lib/validators/gallery";

export type PublicGalleryPhoto = {
  id: string;
  imagePath: string;
  description: string;
  sourceType: "news" | "gallery" | "event";
  sourceTitle: string;
  sourceHref: string;
  publishedAt: Date;
};

function resolvePublishedAt(status: PublicationStatus, publishedAtInput?: string | null): Date | null {
  if (status !== "PUBLISHED") {
    return null;
  }

  if (publishedAtInput) {
    return new Date(publishedAtInput);
  }

  return new Date();
}

export async function getPublicGalleryAlbums() {
  return prisma.galleryAlbum.findMany({
    where: {
      status: "PUBLISHED",
    },
    include: {
      _count: {
        select: {
          items: true,
        },
      },
      event: true,
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function getPublicGalleryPhotos(): Promise<PublicGalleryPhoto[]> {
  const [albums, news] = await Promise.all([
    prisma.galleryAlbum.findMany({
      where: {
        status: "PUBLISHED",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        coverImagePath: true,
        publishedAt: true,
        createdAt: true,
        event: {
          select: {
            title: true,
            slug: true,
          },
        },
        items: {
          where: {
            mediaType: {
              startsWith: "image/",
            },
          },
          select: {
            id: true,
            mediaPath: true,
            caption: true,
            createdAt: true,
          },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        },
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    }),
    prisma.news.findMany({
      where: {
        status: "PUBLISHED",
        coverImagePath: {
          not: null,
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        content: true,
        coverImagePath: true,
        publishedAt: true,
        createdAt: true,
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  const galleryPhotos: PublicGalleryPhoto[] = [];

  for (const album of albums) {
    const publishedAt = album.publishedAt ?? album.createdAt;

    if (album.coverImagePath) {
      const sourceType = album.event ? "event" : "gallery";
      const sourceTitle = album.event ? album.event.title : album.title;
      const sourceHref = album.event ? `/events/${album.event.slug}` : `/gallery/${album.slug}`;

      galleryPhotos.push({
        id: `gallery-cover-${album.id}`,
        imagePath: album.coverImagePath,
        description: album.description || album.title,
        sourceType,
        sourceTitle,
        sourceHref,
        publishedAt,
      });
    }

    for (const item of album.items) {
      const sourceType = album.event ? "event" : "gallery";
      const sourceTitle = album.event ? album.event.title : album.title;
      const sourceHref = album.event ? `/events/${album.event.slug}` : `/gallery/${album.slug}`;

      galleryPhotos.push({
        id: item.id,
        imagePath: item.mediaPath,
        description: item.caption || album.description || album.title,
        sourceType,
        sourceTitle,
        sourceHref,
        publishedAt,
      });
    }
  }

  const newsPhotos: PublicGalleryPhoto[] = news.flatMap((item) => {
    if (!item.coverImagePath) {
      return [];
    }

    return [
      {
        id: `news-cover-${item.id}`,
        imagePath: item.coverImagePath,
        description: item.summary || item.content || item.title,
        sourceType: "news" as const,
        sourceTitle: item.title,
        sourceHref: `/news/${item.slug}`,
        publishedAt: item.publishedAt ?? item.createdAt,
      },
    ];
  });

  const uniqueByPath = new Map<string, PublicGalleryPhoto>();
  for (const photo of [...galleryPhotos, ...newsPhotos]) {
    if (!uniqueByPath.has(photo.imagePath)) {
      uniqueByPath.set(photo.imagePath, photo);
    }
  }

  return Array.from(uniqueByPath.values()).sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

export async function getGalleryAlbumBySlug(slug: string) {
  return prisma.galleryAlbum.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
    },
    include: {
      event: true,
      items: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });
}

export async function getGalleryAlbumById(id: string) {
  return prisma.galleryAlbum.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });
}

export async function getGalleryAdminList() {
  return prisma.galleryAlbum.findMany({
    include: {
      event: true,
      _count: {
        select: {
          items: true,
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }],
  });
}

export async function createGalleryAlbum(input: GalleryAlbumInput, createdById?: string) {
  const slug = await generateUniqueSlug(input.title, async (value) => {
    const existing = await prisma.galleryAlbum.findUnique({ where: { slug: value }, select: { id: true } });
    return Boolean(existing);
  });

  const status = input.status as PublicationStatus;

  return prisma.galleryAlbum.create({
    data: {
      title: input.title,
      slug,
      description: input.description,
      status,
      publishedAt: resolvePublishedAt(status, input.publishedAt || null),
      eventId: input.eventId || null,
      createdById: createdById ?? null,
    },
  });
}

export async function updateGalleryAlbum(id: string, input: GalleryAlbumInput, coverImagePath?: string | null) {
  const slug = await generateUniqueSlug(input.title, async (value) => {
    const existing = await prisma.galleryAlbum.findFirst({
      where: {
        slug: value,
        NOT: { id },
      },
      select: { id: true },
    });
    return Boolean(existing);
  });

  const status = input.status as PublicationStatus;

  const data: Prisma.GalleryAlbumUncheckedUpdateInput = {
    title: input.title,
    slug,
    description: input.description,
    status,
    publishedAt: resolvePublishedAt(status, input.publishedAt || null),
    eventId: input.eventId || null,
  };

  if (coverImagePath !== undefined) {
    data.coverImagePath = coverImagePath;
  }

  return prisma.galleryAlbum.update({
    where: { id },
    data,
  });
}

export async function createGalleryItem(
  albumId: string,
  input: GalleryItemInput,
  media: {
    filePath: string;
    mimeType: string;
  },
) {
  return prisma.galleryItem.create({
    data: {
      albumId,
      mediaPath: media.filePath,
      mediaType: media.mimeType,
      caption: input.caption || null,
      sortOrder: input.sortOrder,
    },
  });
}

export async function updateGalleryItem(
  id: string,
  input: {
    caption?: string | null;
    sortOrder?: number;
  },
) {
  return prisma.galleryItem.update({
    where: { id },
    data: {
      ...(input.caption !== undefined ? { caption: input.caption || null } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    },
  });
}

export async function deleteGalleryItem(id: string) {
  return prisma.galleryItem.delete({ where: { id } });
}

export async function deleteGalleryAlbum(id: string) {
  return prisma.galleryAlbum.delete({ where: { id } });
}
