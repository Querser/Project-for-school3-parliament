import path from "node:path";

import { NextResponse } from "next/server";

import { incrementDocumentDownloads } from "@/features/documents/service";
import { logAppEvent, trackTelemetryEvent } from "@/features/observability/service";
import { prisma } from "@/lib/db/prisma";
import { storage } from "@/lib/storage";
import { getRequestMeta } from "@/lib/utils/request-meta";

export const dynamic = "force-dynamic";

function sanitizeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim();
}

function extensionFromMime(mimeType: string): string {
  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    return ".docx";
  }

  if (mimeType === "application/msword") {
    return ".doc";
  }

  if (mimeType === "application/pdf") {
    return ".pdf";
  }

  if (mimeType === "text/plain") {
    return ".txt";
  }

  return "";
}

function resolveDownloadFileName(document: {
  title: string;
  originalFileName: string;
  mimeType: string;
}): string {
  const normalizedOriginal = sanitizeFileName(document.originalFileName || "");
  const originalExtension = path.extname(normalizedOriginal).toLowerCase();
  const expectedExtension = extensionFromMime(document.mimeType);

  if (expectedExtension) {
    if (originalExtension === expectedExtension && normalizedOriginal.length > expectedExtension.length) {
      return normalizedOriginal;
    }

    const baseName = sanitizeFileName(path.basename(normalizedOriginal, originalExtension) || document.title || "document");
    return `${baseName}${expectedExtension}`;
  }

  if (normalizedOriginal) {
    return normalizedOriginal;
  }

  const fallbackBase = sanitizeFileName(document.title || "document");
  return fallbackBase || "document";
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const startedAt = Date.now();
  const requestMeta = await getRequestMeta();

  try {
    const { id } = await context.params;
    const document = await prisma.document.findUnique({ where: { id } });

    if (!document || document.status !== "PUBLISHED") {
      await logAppEvent({
        group: "HTTP",
        severity: "WARN",
        module: "document-download",
        message: "Document not found for download",
        method: "GET",
        path: `/api/documents/${id}/download`,
        statusCode: 404,
        latencyMs: Date.now() - startedAt,
        ...requestMeta,
      });

      return NextResponse.json({ message: "Документ не найден" }, { status: 404 });
    }

    const fileBuffer = await storage.readFile(document.filePath).catch(() => null);
    if (!fileBuffer) {
      await logAppEvent({
        group: "HTTP",
        severity: "ERROR",
        module: "document-download",
        message: "Document file missing in storage",
        method: "GET",
        path: `/api/documents/${id}/download`,
        statusCode: 404,
        latencyMs: Date.now() - startedAt,
        ...requestMeta,
      });

      return NextResponse.json({ message: "Файл документа не найден" }, { status: 404 });
    }

    const downloadFileName = resolveDownloadFileName(document);

    await Promise.all([
      incrementDocumentDownloads(document.id),
      trackTelemetryEvent({
        category: "content",
        eventType: "document_download",
        path: "/documents",
        value: 1,
        ...requestMeta,
      }),
      logAppEvent({
        group: "DOMAIN",
        severity: "INFO",
        module: "documents",
        message: `Document downloaded: ${document.id}`,
        method: "GET",
        path: `/api/documents/${document.id}/download`,
        statusCode: 200,
        latencyMs: Date.now() - startedAt,
        ...requestMeta,
      }),
    ]);

    const response = new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": document.mimeType || "application/octet-stream",
        "Content-Length": String(fileBuffer.byteLength),
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(downloadFileName)}`,
        "Cache-Control": "private, no-store, max-age=0",
      },
    });

    return response;
  } catch (error) {
    await logAppEvent({
      group: "SYSTEM",
      severity: "ERROR",
      module: "document-download",
      message: "Document download endpoint failed",
      method: "GET",
      path: "/api/documents/[id]/download",
      statusCode: 500,
      latencyMs: Date.now() - startedAt,
      metadata: {
        error: error instanceof Error ? error.message : "unknown",
      },
      ...requestMeta,
    });

    return NextResponse.json({ message: "Ошибка сервера" }, { status: 500 });
  }
}
