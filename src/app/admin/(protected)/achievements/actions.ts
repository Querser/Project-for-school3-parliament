"use server";

import { revalidatePath } from "next/cache";

import { createAchievement, deleteAchievement, getAchievementById, updateAchievement } from "@/features/achievements/service";
import { logAppEvent, logAuditEvent } from "@/features/observability/service";
import { requireAdminSession } from "@/lib/auth/session";
import { achievementSchema } from "@/lib/validators/achievements";
import { getFormStringValue, redirectWithError, redirectWithSuccess } from "@/lib/utils/admin-action";
import { getRequestMeta } from "@/lib/utils/request-meta";

const mutatingRoles = ["CHIEF_ADMIN", "ADMIN", "EDITOR", "MINISTRY_EDITOR"] as const;

function parseAchievementInput(formData: FormData) {
  return achievementSchema.safeParse({
    title: getFormStringValue(formData, "title"),
    content: getFormStringValue(formData, "content"),
    impact: getFormStringValue(formData, "impact"),
    status: getFormStringValue(formData, "status"),
    publishedAt: getFormStringValue(formData, "publishedAt"),
    ministryId: getFormStringValue(formData, "ministryId"),
  });
}

export async function createAchievementAction(formData: FormData) {
  const session = await requireAdminSession([...mutatingRoles]);
  const requestMeta = await getRequestMeta();

  const parsed = parseAchievementInput(formData);
  if (!parsed.success) {
    redirectWithError("/admin/achievements/new", parsed.error.issues[0]?.message ?? "Ошибка валидации");
  }

  const achievement = await createAchievement(parsed.data, session.user.id);

  await Promise.all([
    logAuditEvent({
      action: "CREATE",
      module: "achievements",
      entityType: "Achievement",
      entityId: achievement.id,
      summary: `Создано достижение В«${achievement.title}В»`,
      adminUserId: session.user.id,
      ...requestMeta,
    }),
    logAppEvent({
      group: "DOMAIN",
      severity: "INFO",
      module: "achievements",
      message: `Achievement created: ${achievement.id}`,
      adminUserId: session.user.id,
      ...requestMeta,
    }),
  ]);

  revalidatePath("/");
  revalidatePath("/achievements");
  revalidatePath("/admin/achievements");

  redirectWithSuccess("/admin/achievements", "Достижение создано");
}

export async function updateAchievementAction(id: string, formData: FormData) {
  const session = await requireAdminSession([...mutatingRoles]);
  const requestMeta = await getRequestMeta();

  const existing = await getAchievementById(id);
  if (!existing) {
    redirectWithError("/admin/achievements", "Достижение не найдено");
  }

  const parsed = parseAchievementInput(formData);
  if (!parsed.success) {
    redirectWithError(`/admin/achievements/${id}`, parsed.error.issues[0]?.message ?? "Ошибка валидации");
  }

  const updated = await updateAchievement(id, parsed.data);

  await Promise.all([
    logAuditEvent({
      action: "UPDATE",
      module: "achievements",
      entityType: "Achievement",
      entityId: updated.id,
      summary: `Обновлено достижение В«${updated.title}В»`,
      adminUserId: session.user.id,
      ...requestMeta,
    }),
    logAppEvent({
      group: "DOMAIN",
      severity: "INFO",
      module: "achievements",
      message: `Achievement updated: ${updated.id}`,
      adminUserId: session.user.id,
      ...requestMeta,
    }),
  ]);

  revalidatePath("/");
  revalidatePath("/achievements");
  revalidatePath("/admin/achievements");
  revalidatePath(`/admin/achievements/${id}`);

  redirectWithSuccess("/admin/achievements", "Достижение обновлено");
}

export async function deleteAchievementAction(id: string) {
  const session = await requireAdminSession(["CHIEF_ADMIN", "ADMIN"]);
  const requestMeta = await getRequestMeta();

  const existing = await getAchievementById(id);
  if (!existing) {
    redirectWithError("/admin/achievements", "Достижение не найдено");
  }

  await deleteAchievement(id);

  await Promise.all([
    logAuditEvent({
      action: "DELETE",
      module: "achievements",
      entityType: "Achievement",
      entityId: existing.id,
      summary: `Удалено достижение В«${existing.title}В»`,
      adminUserId: session.user.id,
      ...requestMeta,
    }),
    logAppEvent({
      group: "DOMAIN",
      severity: "WARN",
      module: "achievements",
      message: `Achievement deleted: ${existing.id}`,
      adminUserId: session.user.id,
      ...requestMeta,
    }),
  ]);

  revalidatePath("/");
  revalidatePath("/achievements");
  revalidatePath("/admin/achievements");

  redirectWithSuccess("/admin/achievements", "Достижение удалено");
}

