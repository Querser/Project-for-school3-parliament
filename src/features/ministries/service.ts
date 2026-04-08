import { prisma } from "@/lib/db/prisma";
import { generateUniqueSlug } from "@/lib/utils/slug";
import type { MinistryInput } from "@/lib/validators/ministries";

export async function getMinistriesPublicList() {
  return prisma.ministry.findMany({
    include: {
      ministerMember: true,
      _count: {
        select: {
          news: true,
          reports: true,
          initiatives: true,
        },
      },
    },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });
}

export async function getMinistryBySlug(slug: string) {
  return prisma.ministry.findUnique({
    where: { slug },
    include: {
      ministerMember: true,
      members: {
        orderBy: [{ displayOrder: "asc" }, { fullName: "asc" }],
      },
      news: {
        where: {
          status: "PUBLISHED",
        },
        orderBy: [{ publishedAt: "desc" }],
        take: 6,
      },
      reports: {
        where: {
          status: "PUBLISHED",
        },
        orderBy: [{ publishedAt: "desc" }],
        take: 6,
      },
      initiatives: {
        where: {
          status: {
            in: ["ACCEPTED", "IN_PROGRESS", "IMPLEMENTED"],
          },
        },
        orderBy: [{ updatedAt: "desc" }],
        take: 8,
      },
    },
  });
}

export async function getMinistryById(id: string) {
  return prisma.ministry.findUnique({ where: { id } });
}

export async function getMinistriesAdminList() {
  return prisma.ministry.findMany({
    include: {
      ministerMember: true,
      _count: {
        select: {
          members: true,
          news: true,
          reports: true,
          initiatives: true,
        },
      },
    },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });
}

export async function createMinistry(input: MinistryInput) {
  const slug = await generateUniqueSlug(input.name, async (value) => {
    const existing = await prisma.ministry.findUnique({ where: { slug: value }, select: { id: true } });
    return Boolean(existing);
  });

  return prisma.ministry.create({
    data: {
      name: input.name,
      slug,
      shortDescription: input.description,
      fullDescription: input.description,
      workDirections: input.description,
      initiativeHighlight: null,
      displayOrder: input.displayOrder,
      ministerMemberId: input.ministerMemberId || null,
    },
  });
}

export async function updateMinistry(id: string, input: MinistryInput) {
  const slug = await generateUniqueSlug(input.name, async (value) => {
    const existing = await prisma.ministry.findFirst({
      where: {
        slug: value,
        NOT: { id },
      },
      select: { id: true },
    });
    return Boolean(existing);
  });

  return prisma.ministry.update({
    where: { id },
    data: {
      name: input.name,
      slug,
      shortDescription: input.description,
      fullDescription: input.description,
      workDirections: input.description,
      initiativeHighlight: null,
      displayOrder: input.displayOrder,
      ministerMemberId: input.ministerMemberId || null,
    },
  });
}

export async function deleteMinistry(id: string) {
  return prisma.ministry.delete({ where: { id } });
}
