import type { Prisma, PublicationStatus } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { generateUniqueSlug } from "@/lib/utils/slug";
import type { ReportInput } from "@/lib/validators/reports";

interface ReportPayload {
  input: ReportInput;
  filePath?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  originalFileName?: string | null;
  createdById?: string | null;
}

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

export async function getPublicReports() {
  return prisma.report.findMany({
    where: {
      status: "PUBLISHED",
    },
    include: {
      ministry: true,
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function getReportsAdminList() {
  return prisma.report.findMany({
    include: {
      ministry: true,
    },
    orderBy: [{ updatedAt: "desc" }],
  });
}

export async function getReportBySlug(slug: string) {
  return prisma.report.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
    },
    include: {
      ministry: true,
    },
  });
}

export async function getReportById(id: string) {
  return prisma.report.findUnique({ where: { id } });
}

export async function createReport(payload: ReportPayload) {
  const slug = await generateUniqueSlug(payload.input.title, async (value) => {
    const existing = await prisma.report.findUnique({ where: { slug: value }, select: { id: true } });
    return Boolean(existing);
  });

  const status = payload.input.status as PublicationStatus;

  return prisma.report.create({
    data: {
      title: payload.input.title,
      slug,
      periodLabel: payload.input.periodLabel,
      summary: buildSummaryFromContent(payload.input.content),
      content: payload.input.content,
      status,
      publishedAt: resolvePublishedAt(status, payload.input.publishedAt || null),
      ministryId: payload.input.ministryId || null,
      filePath: payload.filePath ?? null,
      mimeType: payload.mimeType ?? null,
      fileSize: payload.fileSize ?? null,
      originalFileName: payload.originalFileName ?? null,
      createdById: payload.createdById ?? null,
    },
  });
}

export async function updateReport(id: string, payload: ReportPayload) {
  const slug = await generateUniqueSlug(payload.input.title, async (value) => {
    const existing = await prisma.report.findFirst({
      where: {
        slug: value,
        NOT: { id },
      },
      select: { id: true },
    });
    return Boolean(existing);
  });

  const status = payload.input.status as PublicationStatus;

  const data: Prisma.ReportUncheckedUpdateInput = {
    title: payload.input.title,
    slug,
    periodLabel: payload.input.periodLabel,
    summary: buildSummaryFromContent(payload.input.content),
    content: payload.input.content,
    status,
    publishedAt: resolvePublishedAt(status, payload.input.publishedAt || null),
    ministryId: payload.input.ministryId || null,
  };

  if (payload.filePath !== undefined) {
    data.filePath = payload.filePath;
    data.mimeType = payload.mimeType ?? null;
    data.fileSize = payload.fileSize ?? null;
    data.originalFileName = payload.originalFileName ?? null;
  }

  return prisma.report.update({
    where: { id },
    data,
  });
}

export async function deleteReport(id: string) {
  return prisma.report.delete({ where: { id } });
}
