"use server";

import { revalidatePath } from "next/cache";

import {
  createGalleryAlbum,
  createGalleryItem,
  deleteGalleryAlbum,
  deleteGalleryItem,
  getGalleryAlbumById,
  updateGalleryAlbum,
  updateGalleryItem,
} from "@/features/gallery/service";
import { logAppEvent, logAuditEvent } from "@/features/observability/service";
import { DEFAULT_MAX_IMAGE_SIZE, IMAGE_ALLOWED_MIME_TYPES } from "@/lib/constants";
import { requireAdminSession } from "@/lib/auth/session";
import { storage } from "@/lib/storage";
import { galleryAlbumSchema, galleryItemSchema } from "@/lib/validators/gallery";
import { getFormStringValue, getOptionalFile, redirectWithError, redirectWithSuccess } from "@/lib/utils/admin-action";
import { resolveUserFacingErrorMessage } from "@/lib/utils/error-message";
import { getRequestMeta } from "@/lib/utils/request-meta";

const mutatingRoles = ["CHIEF_ADMIN", "ADMIN", "EDITOR", "MINISTRY_EDITOR"] as const;

function parseGalleryAlbumInput(formData: FormData) {
  return galleryAlbumSchema.safeParse({
    title: getFormStringValue(formData, "title"),
    description: getFormStringValue(formData, "description"),
    status: getFormStringValue(formData, "status"),
    publishedAt: getFormStringValue(formData, "publishedAt"),
  });
}

export async function createGalleryAlbumAction(formData: FormData) {
  const session = await requireAdminSession([...mutatingRoles]);
  const requestMeta = await getRequestMeta();

  const parsed = parseGalleryAlbumInput(formData);
  if (!parsed.success) {
    redirectWithError("/admin/gallery/new", parsed.error.issues[0]?.message ?? "Ошибка валидации");
  }

  let coverImagePath: string | null = null;
  const coverImage = getOptionalFile(formData, "coverImage");
  if (coverImage) {
    try {
      const saved = await storage.saveFile(coverImage, {
        folder: "uploads/gallery",
        allowedMimeTypes: IMAGE_ALLOWED_MIME_TYPES,
        maxFileSize: DEFAULT_MAX_IMAGE_SIZE,
      });
      coverImagePath = saved.filePath;
    } catch (error) {
      const message = resolveUserFacingErrorMessage(error, "Ошибка загрузки обложки");
      redirectWithError("/admin/gallery/new", message);
    }
  }

  const album = await createGalleryAlbum(parsed.data, session.user.id);

  if (coverImagePath) {
    await updateGalleryAlbum(album.id, parsed.data, coverImagePath);
  }

  await Promise.all([
    logAuditEvent({
      action: "CREATE",
      module: "gallery",
      entityType: "GalleryAlbum",
      entityId: album.id,
      summary: `Создан альбом «${album.title}»`,
      adminUserId: session.user.id,
      ...requestMeta,
    }),
    logAppEvent({
      group: "DOMAIN",
      severity: "INFO",
      module: "gallery",
      message: `Gallery album created: ${album.id}`,
      adminUserId: session.user.id,
      ...requestMeta,
    }),
  ]);

  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");

  redirectWithSuccess("/admin/gallery", "Альбом создан");
}

export async function updateGalleryAlbumAction(id: string, formData: FormData) {
  const session = await requireAdminSession([...mutatingRoles]);
  const requestMeta = await getRequestMeta();

  const existing = await getGalleryAlbumById(id);
  if (!existing) {
    redirectWithError("/admin/gallery", "Альбом не найден");
  }

  const parsed = parseGalleryAlbumInput(formData);
  if (!parsed.success) {
    redirectWithError(`/admin/gallery/${id}`, parsed.error.issues[0]?.message ?? "Ошибка валидации");
  }

  let coverImagePath: string | null | undefined;

  const coverImage = getOptionalFile(formData, "coverImage");
  if (coverImage) {
    try {
      const saved = await storage.saveFile(coverImage, {
        folder: "uploads/gallery",
        allowedMimeTypes: IMAGE_ALLOWED_MIME_TYPES,
        maxFileSize: DEFAULT_MAX_IMAGE_SIZE,
      });

      coverImagePath = saved.filePath;
      if (existing.coverImagePath) {
        await storage.deleteFile(existing.coverImagePath);
      }
    } catch (error) {
      const message = resolveUserFacingErrorMessage(error, "Ошибка загрузки обложки");
      redirectWithError(`/admin/gallery/${id}`, message);
    }
  }

  const updated = await updateGalleryAlbum(id, parsed.data, coverImagePath);

  await Promise.all([
    logAuditEvent({
      action: "UPDATE",
      module: "gallery",
      entityType: "GalleryAlbum",
      entityId: updated.id,
      summary: `Обновлен альбом «${updated.title}»`,
      adminUserId: session.user.id,
      ...requestMeta,
    }),
    logAppEvent({
      group: "DOMAIN",
      severity: "INFO",
      module: "gallery",
      message: `Gallery album updated: ${updated.id}`,
      adminUserId: session.user.id,
      ...requestMeta,
    }),
  ]);

  revalidatePath("/gallery");
  revalidatePath(`/gallery/${updated.slug}`);
  revalidatePath("/admin/gallery");
  revalidatePath(`/admin/gallery/${id}`);

  redirectWithSuccess("/admin/gallery", "Альбом обновлен");
}

export async function addGalleryItemAction(albumId: string, formData: FormData) {
  const session = await requireAdminSession([...mutatingRoles]);
  const requestMeta = await getRequestMeta();

  const album = await getGalleryAlbumById(albumId);
  if (!album) {
    redirectWithError("/admin/gallery", "Альбом не найден");
  }

  const parsed = galleryItemSchema.safeParse({
    caption: getFormStringValue(formData, "caption"),
    sortOrder: getFormStringValue(formData, "sortOrder") || "0",
  });

  if (!parsed.success) {
    redirectWithError(`/admin/gallery/${albumId}`, parsed.error.issues[0]?.message ?? "Ошибка валидации");
  }

  const file = getOptionalFile(formData, "media");
  if (!file) {
    redirectWithError(`/admin/gallery/${albumId}`, "Добавьте файл для галереи");
  }

  let saved;
  try {
    saved = await storage.saveFile(file, {
      folder: "uploads/gallery",
      allowedMimeTypes: IMAGE_ALLOWED_MIME_TYPES,
      maxFileSize: DEFAULT_MAX_IMAGE_SIZE,
    });
  } catch (error) {
    const message = resolveUserFacingErrorMessage(error, "Ошибка загрузки файла");
    redirectWithError(`/admin/gallery/${albumId}`, message);
  }

  const item = await createGalleryItem(albumId, parsed.data, {
    filePath: saved.filePath,
    mimeType: saved.mimeType,
  });

  await Promise.all([
    logAuditEvent({
      action: "CREATE",
      module: "gallery",
      entityType: "GalleryItem",
      entityId: item.id,
      summary: `Добавлена фотография в альбом ${album.title}`,
      adminUserId: session.user.id,
      ...requestMeta,
    }),
    logAppEvent({
      group: "DOMAIN",
      severity: "INFO",
      module: "gallery",
      message: `Gallery item added: ${item.id}`,
      adminUserId: session.user.id,
      ...requestMeta,
    }),
  ]);

  revalidatePath("/gallery");
  revalidatePath(`/gallery/${album.slug}`);
  revalidatePath(`/admin/gallery/${albumId}`);

  redirectWithSuccess(`/admin/gallery/${albumId}`, "Фотография добавлена");
}

export async function updateGalleryItemAction(albumId: string, itemId: string, formData: FormData) {
  const session = await requireAdminSession([...mutatingRoles]);
  const requestMeta = await getRequestMeta();

  const album = await getGalleryAlbumById(albumId);
  if (!album) {
    redirectWithError("/admin/gallery", "Альбом не найден");
  }

  const parsed = galleryItemSchema.safeParse({
    caption: getFormStringValue(formData, "caption"),
    sortOrder: getFormStringValue(formData, "sortOrder") || "0",
  });
  if (!parsed.success) {
    redirectWithError(`/admin/gallery/${albumId}`, parsed.error.issues[0]?.message ?? "Ошибка валидации");
  }

  const item = album.items.find((galleryItem) => galleryItem.id === itemId);
  if (!item) {
    redirectWithError(`/admin/gallery/${albumId}`, "Фотография не найдена");
  }

  await updateGalleryItem(itemId, {
    caption: parsed.data.caption || null,
    sortOrder: parsed.data.sortOrder,
  });

  await Promise.all([
    logAuditEvent({
      action: "UPDATE",
      module: "gallery",
      entityType: "GalleryItem",
      entityId: item.id,
      summary: `Обновлена фотография в альбоме ${album.title}`,
      adminUserId: session.user.id,
      ...requestMeta,
    }),
    logAppEvent({
      group: "DOMAIN",
      severity: "INFO",
      module: "gallery",
      message: `Gallery item updated: ${item.id}`,
      adminUserId: session.user.id,
      ...requestMeta,
    }),
  ]);

  revalidatePath("/gallery");
  revalidatePath(`/gallery/${album.slug}`);
  revalidatePath(`/admin/gallery/${albumId}`);

  redirectWithSuccess(`/admin/gallery/${albumId}`, "Фотография обновлена");
}

export async function deleteGalleryItemAction(albumId: string, itemId: string) {
  const session = await requireAdminSession([...mutatingRoles]);
  const requestMeta = await getRequestMeta();

  const album = await getGalleryAlbumById(albumId);
  if (!album) {
    redirectWithError("/admin/gallery", "Альбом не найден");
  }

  const item = album.items.find((galleryItem) => galleryItem.id === itemId);
  if (!item) {
    redirectWithError(`/admin/gallery/${albumId}`, "Материал не найден");
  }

  await deleteGalleryItem(itemId);
  await storage.deleteFile(item.mediaPath);

  await Promise.all([
    logAuditEvent({
      action: "DELETE",
      module: "gallery",
      entityType: "GalleryItem",
      entityId: item.id,
      summary: `Удалена фотография из альбома ${album.title}`,
      adminUserId: session.user.id,
      ...requestMeta,
    }),
    logAppEvent({
      group: "DOMAIN",
      severity: "WARN",
      module: "gallery",
      message: `Gallery item deleted: ${item.id}`,
      adminUserId: session.user.id,
      ...requestMeta,
    }),
  ]);

  revalidatePath("/gallery");
  revalidatePath(`/gallery/${album.slug}`);
  revalidatePath(`/admin/gallery/${albumId}`);

  redirectWithSuccess(`/admin/gallery/${albumId}`, "Фотография удалена");
}

export async function deleteGalleryAlbumAction(id: string) {
  const session = await requireAdminSession(["CHIEF_ADMIN", "ADMIN"]);
  const requestMeta = await getRequestMeta();

  const existing = await getGalleryAlbumById(id);
  if (!existing) {
    redirectWithError("/admin/gallery", "Альбом не найден");
  }

  for (const item of existing.items) {
    await storage.deleteFile(item.mediaPath);
  }
  if (existing.coverImagePath) {
    await storage.deleteFile(existing.coverImagePath);
  }

  await deleteGalleryAlbum(id);

  await Promise.all([
    logAuditEvent({
      action: "DELETE",
      module: "gallery",
      entityType: "GalleryAlbum",
      entityId: existing.id,
      summary: `Удален альбом «${existing.title}»`,
      adminUserId: session.user.id,
      ...requestMeta,
    }),
    logAppEvent({
      group: "DOMAIN",
      severity: "WARN",
      module: "gallery",
      message: `Gallery album deleted: ${existing.id}`,
      adminUserId: session.user.id,
      ...requestMeta,
    }),
  ]);

  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");

  redirectWithSuccess("/admin/gallery", "Альбом удален");
}

