import { MemberRoleType } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { generateUniqueSlug } from "@/lib/utils/slug";
import type { MemberInput } from "@/lib/validators/members";

export async function getMembersPublicGrouped() {
  const members = await prisma.member.findMany({
    include: {
      ministries: {
        orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      },
    },
    orderBy: [{ roleType: "asc" }, { displayOrder: "asc" }, { fullName: "asc" }],
  });

  return {
    president: members.filter((item) => item.roleType === MemberRoleType.PRESIDENT),
    vicePresident: members.filter((item) => item.roleType === MemberRoleType.VICE_PRESIDENT),
    deputies: members.filter((item) => item.roleType === MemberRoleType.DEPUTY),
    ministers: members.filter((item) => item.roleType === MemberRoleType.MINISTER),
  };
}

export async function getMembersAdminList() {
  return prisma.member.findMany({
    include: {
      ministries: {
        orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      },
    },
    orderBy: [{ displayOrder: "asc" }, { fullName: "asc" }],
  });
}

export async function getMemberById(id: string) {
  return prisma.member.findUnique({
    where: { id },
    include: {
      ministries: {
        orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      },
    },
  });
}

export async function createMember(input: MemberInput, photoPath?: string | null) {
  const slugSource = input.slug && input.slug.length > 0 ? input.slug : input.fullName;
  const slug = await generateUniqueSlug(slugSource, async (value) => {
    const existing = await prisma.member.findFirst({
      where: { slug: value },
      select: { id: true },
    });
    return Boolean(existing);
  });

  return prisma.member.create({
    data: {
      fullName: input.fullName,
      slug,
      roleType: input.roleType,
      positionTitle: input.positionTitle,
      shortBio: input.shortBio,
      displayOrder: input.displayOrder,
      photoPath: photoPath ?? null,
      ministries: {
        connect: input.ministryIds.map((id) => ({ id })),
      },
    },
  });
}

export async function updateMember(id: string, input: MemberInput, photoPath?: string | null) {
  const slugSource = input.slug && input.slug.length > 0 ? input.slug : input.fullName;
  const slug = await generateUniqueSlug(slugSource, async (value) => {
    const existing = await prisma.member.findFirst({
      where: {
        slug: value,
        NOT: { id },
      },
      select: { id: true },
    });
    return Boolean(existing);
  });

  return prisma.member.update({
    where: { id },
    data: {
      fullName: input.fullName,
      slug,
      roleType: input.roleType,
      positionTitle: input.positionTitle,
      shortBio: input.shortBio,
      displayOrder: input.displayOrder,
      ...(photoPath !== undefined ? { photoPath } : {}),
      ministries: {
        set: input.ministryIds.map((ministryId) => ({ id: ministryId })),
      },
    },
  });
}

export async function deleteMember(id: string) {
  return prisma.member.delete({ where: { id } });
}
