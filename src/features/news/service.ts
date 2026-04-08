import { NewsStatus, type Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { generateUniqueSlug, slugify } from "@/lib/utils/slug";
import type { NewsInput } from "@/lib/validators/news";

type StatusDates = {
  publishedAt: Date | null;
  scheduledAt: Date | null;
};

async function syncScheduledNews(now = new Date()) {
  const dueNews = await prisma.news.findMany({
    where: {
      status: NewsStatus.SCHEDULED,
      scheduledAt: {
        lte: now,
      },
    },
    select: {
      id: true,
      scheduledAt: true,
    },
  });

  if (dueNews.length === 0) {
    return;
  }

  await prisma.$transaction(
    dueNews.map((item) =>
      prisma.news.update({
        where: { id: item.id },
        data: {
          status: NewsStatus.PUBLISHED,
          publishedAt: item.scheduledAt ?? now,
          scheduledAt: null,
        },
      }),
    ),
  );
}

function resolveStatusDates(input: NewsInput): StatusDates {
  const status = input.status as NewsStatus;

  if (status === NewsStatus.PUBLISHED) {
    return {
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : new Date(),
      scheduledAt: null,
    };
  }

  if (status === NewsStatus.SCHEDULED) {
    return {
      publishedAt: null,
      scheduledAt: input.scheduledAt
        ? new Date(input.scheduledAt)
        : input.publishedAt
          ? new Date(input.publishedAt)
          : new Date(),
    };
  }

  return {
    publishedAt: null,
    scheduledAt: null,
  };
}

function buildSummaryFromContent(content: string): string {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (normalized.length <= 180) {
    return normalized;
  }

  return `${normalized.slice(0, 177)}...`;
}

function parseTags(rawTags?: string | null): string[] {
  if (!rawTags) {
    return [];
  }

  return Array.from(
    new Set(
      rawTags
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    ),
  );
}

async function upsertTags(tagNames: string[]) {
  if (tagNames.length === 0) {
    return [] as Array<{ id: string }>;
  }

  const tags = [] as Array<{ id: string }>;

  for (const tagName of tagNames) {
    const normalizedName = tagName.toLowerCase();
    const slug = slugify(normalizedName);

    const saved = await prisma.newsTag.upsert({
      where: { slug },
      update: {
        name: normalizedName,
      },
      create: {
        name: normalizedName,
        slug,
      },
      select: {
        id: true,
      },
    });

    tags.push(saved);
  }

  return tags;
}

async function replaceNewsTags(newsId: string, rawTags?: string | null) {
  const tags = parseTags(rawTags);
  await prisma.newsOnTag.deleteMany({ where: { newsId } });

  if (tags.length === 0) {
    return;
  }

  const savedTags = await upsertTags(tags);

  await prisma.newsOnTag.createMany({
    data: savedTags.map((tag) => ({ newsId, tagId: tag.id })),
    skipDuplicates: true,
  });
}

export async function getLatestPublishedNews(limit = 3) {
  await syncScheduledNews();

  return prisma.news.findMany({
    where: { status: NewsStatus.PUBLISHED },
    include: {
      category: true,
      ministry: true,
      event: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export async function getPublishedNews() {
  await syncScheduledNews();

  return prisma.news.findMany({
    where: { status: NewsStatus.PUBLISHED },
    include: {
      category: true,
      ministry: true,
      event: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function getNewsBySlug(slug: string) {
  await syncScheduledNews();

  return prisma.news.findFirst({
    where: {
      slug,
      status: NewsStatus.PUBLISHED,
    },
    include: {
      category: true,
      ministry: true,
      event: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
}

export async function getNewsById(id: string) {
  return prisma.news.findUnique({
    where: { id },
    include: {
      category: true,
      ministry: true,
      event: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
}

export async function getNewsAdminList() {
  await syncScheduledNews();

  return prisma.news.findMany({
    include: {
      category: true,
      ministry: true,
      event: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }],
  });
}

export async function getNewsMetaOptions() {
  const [categories, ministries, events, tags] = await Promise.all([
    prisma.newsCategory.findMany({ orderBy: [{ name: "asc" }] }),
    prisma.ministry.findMany({ orderBy: [{ displayOrder: "asc" }, { name: "asc" }] }),
    prisma.event.findMany({ orderBy: [{ startAt: "desc" }], take: 100 }),
    prisma.newsTag.findMany({ orderBy: [{ name: "asc" }] }),
  ]);

  return {
    categories,
    ministries,
    events,
    tags,
  };
}

export async function createNews(input: NewsInput, coverImagePath?: string | null, authorId?: string | null) {
  const slug = await generateUniqueSlug(input.title, async (value) => {
    const existing = await prisma.news.findUnique({ where: { slug: value }, select: { id: true } });
    return Boolean(existing);
  });

  const dates = resolveStatusDates(input);

  const created = await prisma.news.create({
    data: {
      title: input.title,
      slug,
      summary: buildSummaryFromContent(input.content),
      content: input.content,
      status: input.status as NewsStatus,
      coverImagePath: coverImagePath ?? null,
      publishedAt: dates.publishedAt,
      scheduledAt: dates.scheduledAt,
      categoryId: input.categoryId || null,
      ministryId: input.ministryId || null,
      eventId: input.eventId || null,
      authorId: authorId ?? null,
    },
  });

  await replaceNewsTags(created.id, input.tags);

  return created;
}

export async function updateNews(id: string, input: NewsInput, coverImagePath?: string | null) {
  const slug = await generateUniqueSlug(input.title, async (value) => {
    const existing = await prisma.news.findFirst({
      where: {
        slug: value,
        NOT: { id },
      },
      select: { id: true },
    });

    return Boolean(existing);
  });

  const dates = resolveStatusDates(input);

  const data: Prisma.NewsUncheckedUpdateInput = {
    title: input.title,
    slug,
    summary: buildSummaryFromContent(input.content),
    content: input.content,
    status: input.status as NewsStatus,
    publishedAt: dates.publishedAt,
    scheduledAt: dates.scheduledAt,
    categoryId: input.categoryId || null,
    ministryId: input.ministryId || null,
    eventId: input.eventId || null,
  };

  if (coverImagePath !== undefined) {
    data.coverImagePath = coverImagePath;
  }

  const updated = await prisma.news.update({
    where: { id },
    data,
  });

  await replaceNewsTags(id, input.tags);

  return updated;
}

export async function deleteNews(id: string) {
  await prisma.newsOnTag.deleteMany({ where: { newsId: id } });
  return prisma.news.delete({ where: { id } });
}
