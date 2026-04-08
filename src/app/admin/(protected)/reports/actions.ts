"use server";

import { revalidatePath } from "next/cache";

import { createReport, deleteReport, getReportById, updateReport } from "@/features/reports/service";
import { logAppEvent, logAuditEvent } from "@/features/observability/service";
import { DEFAULT_MAX_DOCUMENT_SIZE, DOCUMENT_ALLOWED_MIME_TYPES } from "@/lib/constants";
import { requireAdminSession } from "@/lib/auth/session";
import { storage } from "@/lib/storage";
import { reportSchema } from "@/lib/validators/reports";
import { getFormStringValue, getOptionalFile, redirectWithError, redirectWithSuccess } from "@/lib/utils/admin-action";
import { resolveUserFacingErrorMessage } from "@/lib/utils/error-message";
import { getRequestMeta } from "@/lib/utils/request-meta";

const mutatingRoles = ["CHIEF_ADMIN", "ADMIN", "EDITOR", "MINISTRY_EDITOR"] as const;

function parseReportInput(formData: FormData) {
  return reportSchema.safeParse({
    title: getFormStringValue(formData, "title"),
    periodLabel: getFormStringValue(formData, "periodLabel"),
    content: getFormStringValue(formData, "content"),
    status: getFormStringValue(formData, "status"),
    publishedAt: getFormStringValue(formData, "publishedAt"),
    ministryId: getFormStringValue(formData, "ministryId"),
  });
}

export async function createReportAction(formData: FormData) {
  const session = await requireAdminSession([...mutatingRoles]);
  const requestMeta = await getRequestMeta();

  const parsed = parseReportInput(formData);
  if (!parsed.success) {
    redirectWithError("/admin/reports/new", parsed.error.issues[0]?.message ?? "Ошибка валидации");
  }

  let filePath: string | null = null;
  let mimeType: string | null = null;
  let fileSize: number | null = null;
  let originalFileName: string | null = null;

  const file = getOptionalFile(formData, "file");
  if (file) {
    try {
      const saved = await storage.saveFile(file, {
        folder: "uploads/reports",
        allowedMimeTypes: DOCUMENT_ALLOWED_MIME_TYPES,
        maxFileSize: DEFAULT_MAX_DOCUMENT_SIZE,
      });

      filePath = saved.filePath;
      mimeType = saved.mimeType;
      fileSize = saved.fileSize;
      originalFileName = saved.originalFileName;
    } catch (error) {
      const message = resolveUserFacingErrorMessage(error, "Ошибка загрузки файла");
      redirectWithError("/admin/reports/new", message);
    }
  }

  const report = await createReport({
    input: parsed.data,
    filePath,
    mimeType,
    fileSize,
    originalFileName,
    createdById: session.user.id,
  });

  await Promise.all([
    logAuditEvent({
      action: "CREATE",
      module: "reports",
      entityType: "Report",
      entityId: report.id,
      summary: `Создан отчет В«${report.title}В»`,
      afterData: {
        status: report.status,
        periodLabel: report.periodLabel,
      },
      adminUserId: session.user.id,
      ...requestMeta,
    }),
    logAppEvent({
      group: "DOMAIN",
      severity: "INFO",
      module: "reports",
      message: `Report created: ${report.id}`,
      adminUserId: session.user.id,
      ...requestMeta,
    }),
  ]);

  revalidatePath("/reports");
  revalidatePath("/admin/reports");

  redirectWithSuccess("/admin/reports", "Отчет создан");
}

export async function updateReportAction(id: string, formData: FormData) {
  const session = await requireAdminSession([...mutatingRoles]);
  const requestMeta = await getRequestMeta();

  const existing = await getReportById(id);
  if (!existing) {
    redirectWithError("/admin/reports", "Отчет не найден");
  }

  const parsed = parseReportInput(formData);
  if (!parsed.success) {
    redirectWithError(`/admin/reports/${id}`, parsed.error.issues[0]?.message ?? "Ошибка валидации");
  }

  let filePath: string | null | undefined;
  let mimeType: string | null | undefined;
  let fileSize: number | null | undefined;
  let originalFileName: string | null | undefined;

  const file = getOptionalFile(formData, "file");
  if (file) {
    try {
      const saved = await storage.saveFile(file, {
        folder: "uploads/reports",
        allowedMimeTypes: DOCUMENT_ALLOWED_MIME_TYPES,
        maxFileSize: DEFAULT_MAX_DOCUMENT_SIZE,
      });

      filePath = saved.filePath;
      mimeType = saved.mimeType;
      fileSize = saved.fileSize;
      originalFileName = saved.originalFileName;

      if (existing.filePath) {
        await storage.deleteFile(existing.filePath);
      }
    } catch (error) {
      const message = resolveUserFacingErrorMessage(error, "Ошибка загрузки файла");
      redirectWithError(`/admin/reports/${id}`, message);
    }
  }

  const updated = await updateReport(id, {
    input: parsed.data,
    filePath,
    mimeType,
    fileSize,
    originalFileName,
  });

  await Promise.all([
    logAuditEvent({
      action: "UPDATE",
      module: "reports",
      entityType: "Report",
      entityId: updated.id,
      summary: `Обновлен отчет В«${updated.title}В»`,
      beforeData: {
        status: existing.status,
        periodLabel: existing.periodLabel,
      },
      afterData: {
        status: updated.status,
        periodLabel: updated.periodLabel,
      },
      adminUserId: session.user.id,
      ...requestMeta,
    }),
    logAppEvent({
      group: "DOMAIN",
      severity: "INFO",
      module: "reports",
      message: `Report updated: ${updated.id}`,
      adminUserId: session.user.id,
      ...requestMeta,
    }),
  ]);

  revalidatePath("/reports");
  revalidatePath(`/reports/${existing.slug}`);
  revalidatePath("/admin/reports");
  revalidatePath(`/admin/reports/${id}`);

  redirectWithSuccess("/admin/reports", "Отчет обновлен");
}

export async function deleteReportAction(id: string) {
  const session = await requireAdminSession(["CHIEF_ADMIN", "ADMIN"]);
  const requestMeta = await getRequestMeta();

  const existing = await getReportById(id);
  if (!existing) {
    redirectWithError("/admin/reports", "Отчет не найден");
  }

  await deleteReport(id);
  if (existing.filePath) {
    await storage.deleteFile(existing.filePath);
  }

  await Promise.all([
    logAuditEvent({
      action: "DELETE",
      module: "reports",
      entityType: "Report",
      entityId: existing.id,
      summary: `Удален отчет В«${existing.title}В»`,
      beforeData: {
        status: existing.status,
      },
      adminUserId: session.user.id,
      ...requestMeta,
    }),
    logAppEvent({
      group: "DOMAIN",
      severity: "WARN",
      module: "reports",
      message: `Report deleted: ${existing.id}`,
      adminUserId: session.user.id,
      ...requestMeta,
    }),
  ]);

  revalidatePath("/reports");
  revalidatePath("/admin/reports");

  redirectWithSuccess("/admin/reports", "Отчет удален");
}

