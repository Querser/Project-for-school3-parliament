"use server";

import { revalidatePath } from "next/cache";

import { createMember, deleteMember, getMemberById, updateMember } from "@/features/members/service";
import { DEFAULT_MAX_IMAGE_SIZE, IMAGE_ALLOWED_MIME_TYPES } from "@/lib/constants";
import { requireAdminSession } from "@/lib/auth/session";
import { storage } from "@/lib/storage";
import { memberSchema } from "@/lib/validators/members";
import {
  getFormStringValue,
  getFormStringValues,
  getOptionalFile,
  redirectWithError,
  redirectWithSuccess,
} from "@/lib/utils/admin-action";
import { resolveUserFacingErrorMessage } from "@/lib/utils/error-message";

function parseMemberInput(formData: FormData) {
  return memberSchema.safeParse({
    fullName: getFormStringValue(formData, "fullName"),
    slug: getFormStringValue(formData, "slug"),
    roleType: getFormStringValue(formData, "roleType"),
    positionTitle: getFormStringValue(formData, "positionTitle"),
    shortBio: getFormStringValue(formData, "shortBio"),
    ministryIds: getFormStringValues(formData, "ministryIds"),
    displayOrder: getFormStringValue(formData, "displayOrder") || "0",
  });
}

const mutatingRoles = ["CHIEF_ADMIN", "ADMIN"] as const;

export async function createMemberAction(formData: FormData) {
  await requireAdminSession([...mutatingRoles]);

  const parsed = parseMemberInput(formData);
  if (!parsed.success) {
    redirectWithError("/admin/members/new", parsed.error.issues[0]?.message ?? "Ошибка валидации");
  }

  let photoPath: string | null = null;
  const photo = getOptionalFile(formData, "photo");

  if (photo) {
    try {
      const saved = await storage.saveFile(photo, {
        folder: "uploads/members",
        allowedMimeTypes: IMAGE_ALLOWED_MIME_TYPES,
        maxFileSize: DEFAULT_MAX_IMAGE_SIZE,
      });
      photoPath = saved.filePath;
    } catch (error) {
      const message = resolveUserFacingErrorMessage(error, "Ошибка загрузки фото");
      redirectWithError("/admin/members/new", message);
    }
  }

  await createMember(parsed.data, photoPath);

  revalidatePath("/members");
  revalidatePath("/ministries");
  revalidatePath("/admin/members");

  redirectWithSuccess("/admin/members", "Участник добавлен");
}

export async function updateMemberAction(id: string, formData: FormData) {
  await requireAdminSession([...mutatingRoles]);

  const existing = await getMemberById(id);
  if (!existing) {
    redirectWithError("/admin/members", "Участник не найден");
  }

  const parsed = parseMemberInput(formData);
  if (!parsed.success) {
    redirectWithError(`/admin/members/${id}`, parsed.error.issues[0]?.message ?? "Ошибка валидации");
  }

  const removePhoto = getFormStringValue(formData, "removePhoto") === "on";
  let photoPath: string | null | undefined = undefined;

  const photo = getOptionalFile(formData, "photo");
  if (photo) {
    try {
      const saved = await storage.saveFile(photo, {
        folder: "uploads/members",
        allowedMimeTypes: IMAGE_ALLOWED_MIME_TYPES,
        maxFileSize: DEFAULT_MAX_IMAGE_SIZE,
      });
      photoPath = saved.filePath;

      if (existing.photoPath) {
        await storage.deleteFile(existing.photoPath);
      }
    } catch (error) {
      const message = resolveUserFacingErrorMessage(error, "Ошибка загрузки фото");
      redirectWithError(`/admin/members/${id}`, message);
    }
  } else if (removePhoto) {
    photoPath = null;
    if (existing.photoPath) {
      await storage.deleteFile(existing.photoPath);
    }
  }

  await updateMember(id, parsed.data, photoPath);

  revalidatePath("/members");
  revalidatePath("/ministries");
  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${id}`);

  redirectWithSuccess("/admin/members", "Данные участника обновлены");
}

export async function deleteMemberAction(id: string) {
  await requireAdminSession([...mutatingRoles]);

  const existing = await getMemberById(id);
  if (!existing) {
    redirectWithError("/admin/members", "Участник не найден");
  }

  await deleteMember(id);

  if (existing.photoPath) {
    await storage.deleteFile(existing.photoPath);
  }

  revalidatePath("/members");
  revalidatePath("/ministries");
  revalidatePath("/admin/members");

  redirectWithSuccess("/admin/members", "Участник удалён");
}
