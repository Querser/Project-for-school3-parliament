import type { PublicationStatus } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { generateUniqueSlug } from "@/lib/utils/slug";
import type { AchievementInput } from "@/lib/validators/achievements";

function resolvePublishedAt(status: PublicationStatus, publishedAtInput?: string | null): Date | null {
  if (status !== "PUBLISHED") {
    return null;
  }

  if (publishedAtInput) {
    return new Date(publishedAtInput);
  }

  return new Date();
}

function buildSummaryFromContent(content: string): string {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (normalized.length <= 180) {
    return normalized;
  }

  return `${normalized.slice(0, 177)}...`;
}

export async function getPublicAchievements() {
  return prisma.achievement.findMany({
    where: {
      status: "PUBLISHED",
    },
    include: {
      ministry: true,
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function getAchievementsAdminList() {
  return prisma.achievement.findMany({
    include: {
      ministry: true,
    },
    orderBy: [{ updatedAt: "desc" }],
  });
}

export async function getAchievementById(id: string) {
  return prisma.achievement.findUnique({ where: { id } });
}

export async function createAchievement(input: AchievementInput, createdById?: string) {
  const slug = await generateUniqueSlug(input.title, async (value) => {
    const existing = await prisma.achievement.findUnique({ where: { slug: value }, select: { id: true } });
    return Boolean(existing);
  });

  const status = input.status as PublicationStatus;

  return prisma.achievement.create({
    data: {
      title: input.title,
      slug,
      summary: buildSummaryFromContent(input.content),
      content: input.content,
      impact: input.impact || null,
      status,
      publishedAt: resolvePublishedAt(status, input.publishedAt || null),
      ministryId: input.ministryId || null,
      createdById: createdById ?? null,
    },
  });
}

export async function updateAchievement(id: string, input: AchievementInput) {
  const slug = await generateUniqueSlug(input.title, async (value) => {
    const existing = await prisma.achievement.findFirst({
      where: {
        slug: value,
        NOT: { id },
      },
      select: { id: true },
    });
    return Boolean(existing);
  });

  const status = input.status as PublicationStatus;

  return prisma.achievement.update({
    where: { id },
    data: {
      title: input.title,
      slug,
      summary: buildSummaryFromContent(input.content),
      content: input.content,
      impact: input.impact || null,
      status,
      publishedAt: resolvePublishedAt(status, input.publishedAt || null),
      ministryId: input.ministryId || null,
    },
  });
}

export async function deleteAchievement(id: string) {
  return prisma.achievement.delete({ where: { id } });
}
