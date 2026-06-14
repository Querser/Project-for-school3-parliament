import { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/db/prisma";

function isDatabaseUnavailableError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("can't reach database server") ||
    message.includes("p1001") ||
    message.includes("econnrefused") ||
    message.includes("connection")
  );
}

function logFallback(context: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[settings-service] ${context}: ${message}`);
}

const getSiteSettingsMapCached = unstable_cache(
  async () => {
    try {
      const settings = await prisma.siteSetting.findMany();

      return settings.reduce<Record<string, string>>((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {});
    } catch (error) {
      if (isDatabaseUnavailableError(error)) {
        logFallback("site settings fallback to empty map", error);
        return {} as Record<string, string>;
      }

      throw error;
    }
  },
  ["site-settings-map"],
  {
    tags: ["site-settings"],
    revalidate: 300,
  },
);

const getHomeBlocksCached = unstable_cache(
  async () => {
    try {
      return await prisma.homeBlock.findMany({
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      });
    } catch (error) {
      if (isDatabaseUnavailableError(error)) {
        logFallback("home blocks fallback to empty list", error);
        return [];
      }

      throw error;
    }
  },
  ["home-blocks"],
  {
    tags: ["home-blocks"],
    revalidate: 300,
  },
);

export async function getSiteSetting(key: string) {
  try {
    return await prisma.siteSetting.findUnique({ where: { key } });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      logFallback(`site setting fallback to null for key ${key}`, error);
      return null;
    }

    throw error;
  }
}

export async function getSiteSettingsMap() {
  return getSiteSettingsMapCached();
}

export async function upsertSiteSetting(key: string, value: string) {
  return prisma.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function getHomeBlocks() {
  return getHomeBlocksCached();
}

export async function updateHomeBlock(
  key: string,
  input: {
    title: string;
    description: string;
    ctaLabel?: string | null;
    ctaHref?: string | null;
    displayOrder?: number;
    isEnabled?: boolean;
  },
) {
  return prisma.homeBlock.upsert({
    where: { key },
    update: {
      title: input.title,
      description: input.description,
      ctaLabel: input.ctaLabel ?? null,
      ctaHref: input.ctaHref ?? null,
      displayOrder: input.displayOrder ?? 0,
      isEnabled: input.isEnabled ?? true,
    },
    create: {
      key,
      title: input.title,
      description: input.description,
      ctaLabel: input.ctaLabel ?? null,
      ctaHref: input.ctaHref ?? null,
      displayOrder: input.displayOrder ?? 0,
      isEnabled: input.isEnabled ?? true,
    },
  });
}

export async function getDashboardCounters() {
  try {
    const [
      publishedNews,
      draftNews,
      scheduledNews,
      documents,
      ministries,
      members,
      newInitiatives,
      galleryAlbumsPublished,
      achievementsPublished,
      pendingModeration,
    ] = await Promise.all([
      prisma.news.count({ where: { status: "PUBLISHED" } }),
      prisma.news.count({ where: { status: "DRAFT" } }),
      prisma.news.count({ where: { status: "SCHEDULED" } }),
      prisma.document.count({ where: { status: "PUBLISHED" } }),
      prisma.ministry.count(),
      prisma.member.count(),
      prisma.initiative.count({ where: { status: "NEW" } }),
      prisma.galleryAlbum.count({ where: { status: "PUBLISHED" } }),
      prisma.achievement.count({ where: { status: "PUBLISHED" } }),
      prisma.initiative.count({
        where: {
          status: {
            in: ["NEW", "UNDER_REVIEW"],
          },
        },
      }),
    ]);

    return {
      publishedNews,
      draftNews,
      scheduledNews,
      documents,
      ministries,
      members,
      newInitiatives,
      galleryAlbumsPublished,
      achievementsPublished,
      pendingModeration,
    };
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      logFallback("dashboard counters fallback to zeroes", error);
      return {
        publishedNews: 0,
        draftNews: 0,
        scheduledNews: 0,
        documents: 0,
        ministries: 0,
        members: 0,
        newInitiatives: 0,
        galleryAlbumsPublished: 0,
        achievementsPublished: 0,
        pendingModeration: 0,
      };
    }

    throw error;
  }
}
