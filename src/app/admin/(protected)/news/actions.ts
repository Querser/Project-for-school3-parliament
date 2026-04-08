"use server";

import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/auth/session";
import { DEFAULT_MAX_IMAGE_SIZE, IMAGE_ALLOWED_MIME_TYPES } from "@/lib/constants";
import { storage } from "@/lib/storage";
import { getFormStringValue, getOptionalFile, redirectWithError, redirectWithSuccess } from "@/lib/utils/admin-action";
import { resolveUserFacingErrorMessage } from "@/lib/utils/error-message";
import { getRequestMeta } from "@/lib/utils/request-meta";
import { newsSchema } from "@/lib/validators/news";
import { createNews, deleteNews, getNewsById, updateNews } from "@/features/news/service";
import { logAppEvent, logAuditEvent } from "@/features/observability/service";

function parseNewsInput(formData: FormData) {
  return newsSchema.safeParse({
    title: getFormStringValue(formData, "title"),
    content: getFormStringValue(formData, "content"),
    status: getFormStringValue(formData, "status"),
    publishedAt: getFormStringValue(formData, "publishedAt"),
    scheduledAt: getFormStringValue(formData, "scheduledAt"),
    categoryId: getFormStringValue(formData, "categoryId"),
    ministryId: getFormStringValue(formData, "ministryId"),
    eventId: getFormStringValue(formData, "eventId"),
    tags: getFormStringValue(formData, "tags"),
  });
}

export async function createNewsAction(formData: FormData) {
  const session = await requireAdminSession(["CHIEF_ADMIN", "ADMIN", "EDITOR", "MINISTRY_EDITOR"]);
  const requestMeta = await getRequestMeta();

  const parsed = parseNewsInput(formData);
  if (!parsed.success) {
    redirectWithError("/admin/news/new", parsed.error.issues[0]?.message ?? "Ошибка валидации");
  }

  let coverImagePath: string | null = null;

  const coverImage = getOptionalFile(formData, "coverImage");
  if (coverImage) {
    try {
      const saved = await storage.saveFile(coverImage, {
        folder: "uploads/news",
        allowedMimeTypes: IMAGE_ALLOWED_MIME_TYPES,
        maxFileSize: DEFAULT_MAX_IMAGE_SIZE,
      });
      coverImagePath = saved.filePath;
    } catch (error) {
      const message = resolveUserFacingErrorMessage(error, "Ошибка загрузки изображения");
      redirectWithError("/admin/news/new", message);
    }
  }

  const created = await createNews(parsed.data, coverImagePath, session.user.id);

  await Promise.all([
    logAuditEvent({
      action: "CREATE",
      module: "news",
      entityType: "News",
      entityId: created.id,
      summary: `Создана новость «${created.title}»`,
      adminUserId: session.user.id,
      ...requestMeta,
    }),
    logAppEvent({
      group: "DOMAIN",
      severity: "INFO",
      module: "news",
      message: `News created: ${created.id}`,
      adminUserId: session.user.id,
      ...requestMeta,
    }),
  ]);

  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/admin/news");

  redirectWithSuccess("/admin/news", "Новость успешно создана");
}

export async function updateNewsAction(id: string, formData: FormData) {
  const session = await requireAdminSession(["CHIEF_ADMIN", "ADMIN", "EDITOR", "MINISTRY_EDITOR"]);
  const requestMeta = await getRequestMeta();

  const existing = await getNewsById(id);
  if (!existing) {
    redirectWithError("/admin/news", "Новость не найдена");
  }

  const parsed = parseNewsInput(formData);
  if (!parsed.success) {
    redirectWithError(`/admin/news/${id}`, parsed.error.issues[0]?.message ?? "Ошибка валидации");
  }

  const removeCover = getFormStringValue(formData, "removeCover") === "on";
  let coverImagePath: string | null | undefined;

  const coverImage = getOptionalFile(formData, "coverImage");
  if (coverImage) {
    try {
      const saved = await storage.saveFile(coverImage, {
        folder: "uploads/news",
        allowedMimeTypes: IMAGE_ALLOWED_MIME_TYPES,
        maxFileSize: DEFAULT_MAX_IMAGE_SIZE,
      });
      coverImagePath = saved.filePath;

      if (existing.coverImagePath) {
        await storage.deleteFile(existing.coverImagePath);
      }
    } catch (error) {
      const message = resolveUserFacingErrorMessage(error, "Ошибка загрузки изображения");
      redirectWithError(`/admin/news/${id}`, message);
    }
  } else if (removeCover) {
    coverImagePath = null;
    if (existing.coverImagePath) {
      await storage.deleteFile(existing.coverImagePath);
    }
  }

  const updated = await updateNews(id, parsed.data, coverImagePath);

  await Promise.all([
    logAuditEvent({
      action: "UPDATE",
      module: "news",
      entityType: "News",
      entityId: updated.id,
      summary: `Обновлена новость «${updated.title}»`,
      adminUserId: session.user.id,
      ...requestMeta,
    }),
    logAppEvent({
      group: "DOMAIN",
      severity: "INFO",
      module: "news",
      message: `News updated: ${updated.id}`,
      adminUserId: session.user.id,
      ...requestMeta,
    }),
  ]);

  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath(`/news/${existing.slug}`);
  revalidatePath("/admin/news");
  revalidatePath(`/admin/news/${id}`);

  redirectWithSuccess("/admin/news", "Новость обновлена");
}

export async function deleteNewsAction(id: string) {
  const session = await requireAdminSession(["CHIEF_ADMIN", "ADMIN"]);
  const requestMeta = await getRequestMeta();

  const existing = await getNewsById(id);
  if (!existing) {
    redirectWithError("/admin/news", "Новость не найдена");
  }

  if (existing.coverImagePath) {
    await storage.deleteFile(existing.coverImagePath);
  }

  await deleteNews(id);

  await Promise.all([
    logAuditEvent({
      action: "DELETE",
      module: "news",
      entityType: "News",
      entityId: existing.id,
      summary: `Удалена новость «${existing.title}»`,
      adminUserId: session.user.id,
      ...requestMeta,
    }),
    logAppEvent({
      group: "DOMAIN",
      severity: "WARN",
      module: "news",
      message: `News deleted: ${existing.id}`,
      adminUserId: session.user.id,
      ...requestMeta,
    }),
  ]);

  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/admin/news");

  redirectWithSuccess("/admin/news", "Новость удалена");
}
