"use server";

import { revalidatePath } from "next/cache";

import { createDocument, deleteDocument, getDocumentById, updateDocument } from "@/features/documents/service";
import {
  DEFAULT_MAX_DOCUMENT_SIZE,
  DOCUMENT_ALLOWED_MIME_TYPES,
} from "@/lib/constants";
import { requireAdminSession } from "@/lib/auth/session";
import { storage } from "@/lib/storage";
import { documentSchema } from "@/lib/validators/documents";
import {
  getFormStringValue,
  getOptionalFile,
  redirectWithError,
  redirectWithSuccess,
} from "@/lib/utils/admin-action";
import { resolveUserFacingErrorMessage } from "@/lib/utils/error-message";

function parseDocumentInput(formData: FormData) {
  return documentSchema.safeParse({
    title: getFormStringValue(formData, "title"),
    description: getFormStringValue(formData, "description"),
    category: getFormStringValue(formData, "category"),
    publishedAt: getFormStringValue(formData, "publishedAt"),
  });
}

const mutatingRoles = ["CHIEF_ADMIN", "ADMIN", "EDITOR", "MINISTRY_EDITOR"] as const;

export async function createDocumentAction(formData: FormData) {
  await requireAdminSession([...mutatingRoles]);

  const parsed = parseDocumentInput(formData);
  if (!parsed.success) {
    redirectWithError("/admin/documents/new", parsed.error.issues[0]?.message ?? "Ошибка валидации");
  }

  const file = getOptionalFile(formData, "file");
  if (!file) {
    redirectWithError("/admin/documents/new", "Загрузите файл документа");
  }

  try {
    const saved = await storage.saveFile(file, {
      folder: "uploads/documents",
      allowedMimeTypes: DOCUMENT_ALLOWED_MIME_TYPES,
      maxFileSize: DEFAULT_MAX_DOCUMENT_SIZE,
    });

    await createDocument({
      ...parsed.data,
      ...saved,
    });
  } catch (error) {
    const message = resolveUserFacingErrorMessage(error, "Ошибка загрузки документа");
    redirectWithError("/admin/documents/new", message);
  }

  revalidatePath("/documents");
  revalidatePath("/admin/documents");

  redirectWithSuccess("/admin/documents", "Документ успешно добавлен");
}

export async function updateDocumentAction(id: string, formData: FormData) {
  await requireAdminSession([...mutatingRoles]);

  const existing = await getDocumentById(id);
  if (!existing) {
    redirectWithError("/admin/documents", "Документ не найден");
  }

  const parsed = parseDocumentInput(formData);
  if (!parsed.success) {
    redirectWithError(`/admin/documents/${id}`, parsed.error.issues[0]?.message ?? "Ошибка валидации");
  }

  const file = getOptionalFile(formData, "file");

  if (!file) {
    await updateDocument(id, parsed.data);
  } else {
    try {
      const saved = await storage.saveFile(file, {
        folder: "uploads/documents",
        allowedMimeTypes: DOCUMENT_ALLOWED_MIME_TYPES,
        maxFileSize: DEFAULT_MAX_DOCUMENT_SIZE,
      });

      await updateDocument(id, {
        ...parsed.data,
        ...saved,
      });

      await storage.deleteFile(existing.filePath);
    } catch (error) {
      const message = resolveUserFacingErrorMessage(error, "Ошибка обновления файла");
      redirectWithError(`/admin/documents/${id}`, message);
    }
  }

  revalidatePath("/documents");
  revalidatePath("/admin/documents");
  revalidatePath(`/admin/documents/${id}`);

  redirectWithSuccess("/admin/documents", "Документ обновлён");
}

export async function deleteDocumentAction(id: string) {
  await requireAdminSession(["CHIEF_ADMIN", "ADMIN"]);

  const existing = await getDocumentById(id);
  if (!existing) {
    redirectWithError("/admin/documents", "Документ не найден");
  }

  await deleteDocument(id);
  await storage.deleteFile(existing.filePath);

  revalidatePath("/documents");
  revalidatePath("/admin/documents");

  redirectWithSuccess("/admin/documents", "Документ удалён");
}
