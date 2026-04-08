import type { PublicationStatus } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import type { DocumentInput } from "@/lib/validators/documents";

interface DocumentPayload extends DocumentInput {
  filePath: string;
  mimeType: string;
  fileSize: number;
  originalFileName: string;
}

function resolvePublishedAt(status: PublicationStatus, publishedAtInput?: string | null): Date {
  if (status === "PUBLISHED") {
    if (publishedAtInput) {
      return new Date(publishedAtInput);
    }

    return new Date();
  }

  return publishedAtInput ? new Date(publishedAtInput) : new Date();
}

export async function getPublicDocuments() {
  return prisma.document.findMany({
    where: {
      status: "PUBLISHED",
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function getDocumentsAdminList() {
  return prisma.document.findMany({
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function getDocumentById(id: string) {
  return prisma.document.findUnique({ where: { id } });
}

export async function createDocument(payload: DocumentPayload) {
  return prisma.document.create({
    data: {
      title: payload.title,
      description: payload.description,
      category: payload.category,
      version: "1.0",
      filePath: payload.filePath,
      mimeType: payload.mimeType,
      fileSize: payload.fileSize,
      originalFileName: payload.originalFileName,
      status: "PUBLISHED",
      publishedAt: resolvePublishedAt("PUBLISHED", payload.publishedAt),
    },
  });
}

export async function updateDocument(id: string, payload: Partial<DocumentPayload>) {
  return prisma.document.update({
    where: { id },
    data: {
      ...(payload.title !== undefined ? { title: payload.title } : {}),
      ...(payload.description !== undefined ? { description: payload.description } : {}),
      ...(payload.category !== undefined ? { category: payload.category } : {}),
      ...(payload.publishedAt !== undefined ? { publishedAt: new Date(payload.publishedAt) } : {}),
      ...(payload.filePath !== undefined ? { filePath: payload.filePath } : {}),
      ...(payload.mimeType !== undefined ? { mimeType: payload.mimeType } : {}),
      ...(payload.fileSize !== undefined ? { fileSize: payload.fileSize } : {}),
      ...(payload.originalFileName !== undefined
        ? { originalFileName: payload.originalFileName }
        : {}),
    },
  });
}

export async function incrementDocumentDownloads(id: string) {
  return prisma.document.update({
    where: { id },
    data: {
      downloadsCount: {
        increment: 1,
      },
    },
  });
}

export async function deleteDocument(id: string) {
  return prisma.document.delete({ where: { id } });
}
