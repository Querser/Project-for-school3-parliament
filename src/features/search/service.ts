import { prisma } from "@/lib/db/prisma";

export type SearchScope =
  | "all"
  | "news"
  | "documents"
  | "ministries"
  | "achievements";

export async function runGlobalSearch(query: string, scope: SearchScope = "all") {
  const q = query.trim();
  if (!q) {
    return {
      news: [],
      documents: [],
      ministries: [],
      achievements: [],
    };
  }

  const contains = {
    contains: q,
    mode: "insensitive" as const,
  };

  const [news, documents, ministries, achievements] = await Promise.all([
    scope === "all" || scope === "news"
      ? prisma.news.findMany({
          where: {
            status: "PUBLISHED",
            OR: [{ title: contains }, { summary: contains }, { content: contains }],
          },
          take: 8,
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        })
      : Promise.resolve([]),
    scope === "all" || scope === "documents"
      ? prisma.document.findMany({
          where: {
            status: "PUBLISHED",
            OR: [{ title: contains }, { description: contains }, { category: contains }],
          },
          take: 8,
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        })
      : Promise.resolve([]),
    scope === "all" || scope === "ministries"
      ? prisma.ministry.findMany({
          where: {
            OR: [{ name: contains }, { shortDescription: contains }, { fullDescription: contains }],
          },
          take: 8,
          orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
        })
      : Promise.resolve([]),
    scope === "all" || scope === "achievements"
      ? prisma.achievement.findMany({
          where: {
            status: "PUBLISHED",
            OR: [{ title: contains }, { summary: contains }, { content: contains }, { impact: contains }],
          },
          take: 8,
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        })
      : Promise.resolve([]),
  ]);

  return {
    news,
    documents,
    ministries,
    achievements,
  };
}
