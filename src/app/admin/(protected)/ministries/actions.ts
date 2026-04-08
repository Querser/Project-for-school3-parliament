"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import {
  createMinistry,
  deleteMinistry,
  getMinistryById,
  updateMinistry,
} from "@/features/ministries/service";
import { requireAdminSession } from "@/lib/auth/session";
import { getFormStringValue, redirectWithError, redirectWithSuccess } from "@/lib/utils/admin-action";
import { ministrySchema } from "@/lib/validators/ministries";

const mutatingRoles = ["CHIEF_ADMIN", "ADMIN", "EDITOR", "MINISTRY_EDITOR"] as const;

function parseMinistryInput(formData: FormData) {
  return ministrySchema.safeParse({
    name: getFormStringValue(formData, "name"),
    description: getFormStringValue(formData, "description"),
    ministerMemberId: getFormStringValue(formData, "ministerMemberId"),
    displayOrder: getFormStringValue(formData, "displayOrder") || "0",
  });
}

function isMinisterUniqueConstraintError(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
    return false;
  }

  const target = error.meta?.target;
  return Array.isArray(target) && target.includes("ministerMemberId");
}

export async function createMinistryAction(formData: FormData) {
  await requireAdminSession([...mutatingRoles]);

  const parsed = parseMinistryInput(formData);
  if (!parsed.success) {
    redirectWithError("/admin/ministries/new", parsed.error.issues[0]?.message ?? "Ошибка валидации");
  }

  try {
    await createMinistry(parsed.data);
  } catch (error) {
    if (isMinisterUniqueConstraintError(error)) {
      redirectWithError(
        "/admin/ministries/new",
        "Этот участник уже назначен министром в другом министерстве. Выберите другого министра.",
      );
    }

    redirectWithError("/admin/ministries/new", "Не удалось создать министерство");
  }

  revalidatePath("/ministries");
  revalidatePath("/admin/ministries");

  redirectWithSuccess("/admin/ministries", "Министерство создано");
}

export async function updateMinistryAction(id: string, formData: FormData) {
  await requireAdminSession([...mutatingRoles]);

  const existing = await getMinistryById(id);
  if (!existing) {
    redirectWithError("/admin/ministries", "Министерство не найдено");
  }

  const parsed = parseMinistryInput(formData);
  if (!parsed.success) {
    redirectWithError(`/admin/ministries/${id}`, parsed.error.issues[0]?.message ?? "Ошибка валидации");
  }

  try {
    await updateMinistry(id, parsed.data);
  } catch (error) {
    if (isMinisterUniqueConstraintError(error)) {
      redirectWithError(
        `/admin/ministries/${id}`,
        "Этот участник уже назначен министром в другом министерстве. Выберите другого министра.",
      );
    }

    redirectWithError(`/admin/ministries/${id}`, "Не удалось обновить министерство");
  }

  revalidatePath("/ministries");
  revalidatePath(`/ministries/${existing.slug}`);
  revalidatePath("/admin/ministries");
  revalidatePath(`/admin/ministries/${id}`);

  redirectWithSuccess("/admin/ministries", "Министерство обновлено");
}

export async function deleteMinistryAction(id: string) {
  await requireAdminSession(["CHIEF_ADMIN", "ADMIN"]);

  const existing = await getMinistryById(id);
  if (!existing) {
    redirectWithError("/admin/ministries", "Министерство не найдено");
  }

  await deleteMinistry(id);

  revalidatePath("/ministries");
  revalidatePath("/admin/ministries");

  redirectWithSuccess("/admin/ministries", "Министерство удалено");
}
