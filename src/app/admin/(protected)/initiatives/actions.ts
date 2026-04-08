"use server";

import { revalidatePath } from "next/cache";

import { addInitiativeNote, deleteInitiative, getInitiativeById, updateInitiative } from "@/features/initiatives/service";
import { logAppEvent, logAuditEvent } from "@/features/observability/service";
import { requireAdminSession } from "@/lib/auth/session";
import { initiativeSchema } from "@/lib/validators/initiatives";
import { getFormStringValue, redirectWithError, redirectWithSuccess } from "@/lib/utils/admin-action";
import { getRequestMeta } from "@/lib/utils/request-meta";

const mutatingRoles = ["CHIEF_ADMIN", "ADMIN", "EDITOR", "MINISTRY_EDITOR"] as const;

function parseInitiativeInput(formData: FormData) {
  return initiativeSchema.safeParse({
    title: getFormStringValue(formData, "title"),
    description: getFormStringValue(formData, "description"),
    submitterName: getFormStringValue(formData, "submitterName"),
    submitterContact: getFormStringValue(formData, "submitterContact"),
    submitterClass: getFormStringValue(formData, "submitterClass"),
    isAnonymous: getFormStringValue(formData, "isAnonymous") === "on",
    priority: getFormStringValue(formData, "priority"),
    status: getFormStringValue(formData, "status"),
    assignedMinistryId: getFormStringValue(formData, "assignedMinistryId"),
    assignedAdminId: getFormStringValue(formData, "assignedAdminId"),
    publicShowcase: getFormStringValue(formData, "publicShowcase") === "on",
  });
}

export async function updateInitiativeAction(id: string, formData: FormData) {
  const session = await requireAdminSession([...mutatingRoles]);
  const requestMeta = await getRequestMeta();

  const existing = await getInitiativeById(id);
  if (!existing) {
    redirectWithError("/admin/initiatives", "Инициатива не найдена");
  }

  const parsed = parseInitiativeInput(formData);
  if (!parsed.success) {
    redirectWithError(`/admin/initiatives/${id}`, parsed.error.issues[0]?.message ?? "Ошибка валидации");
  }

  const updated = await updateInitiative(id, {
    input: parsed.data,
  });

  if (!updated) {
    redirectWithError("/admin/initiatives", "Не удалось обновить инициативу");
  }

  const note = getFormStringValue(formData, "moderationNote");
  if (note) {
    await addInitiativeNote({
      initiativeId: id,
      authorId: session.user.id,
      note,
      isStatusChange: existing.status !== updated.status,
      fromStatus: existing.status,
      toStatus: updated.status,
    });
  }

  await Promise.all([
    logAuditEvent({
      action: "UPDATE",
      module: "initiatives",
      entityType: "Initiative",
      entityId: updated.id,
      summary: `Обновлена инициатива «${updated.title}»`,
      beforeData: {
        status: existing.status,
        priority: existing.priority,
        assignedMinistryId: existing.assignedMinistryId,
      },
      afterData: {
        status: updated.status,
        priority: updated.priority,
        assignedMinistryId: updated.assignedMinistryId,
      },
      adminUserId: session.user.id,
      ...requestMeta,
    }),
    logAppEvent({
      group: "DOMAIN",
      severity: "INFO",
      module: "initiatives",
      message: `Initiative updated: ${updated.id}`,
      adminUserId: session.user.id,
      ...requestMeta,
    }),
  ]);

  revalidatePath("/initiatives");
  revalidatePath("/admin");
  revalidatePath("/admin/initiatives");
  revalidatePath(`/admin/initiatives/${id}`);

  redirectWithSuccess("/admin/initiatives", "Инициатива обновлена");
}

export async function deleteInitiativeAction(id: string) {
  const session = await requireAdminSession(["CHIEF_ADMIN", "ADMIN"]);
  const requestMeta = await getRequestMeta();

  const existing = await getInitiativeById(id);
  if (!existing) {
    redirectWithError("/admin/initiatives", "Инициатива не найдена");
  }

  await deleteInitiative(id);

  await Promise.all([
    logAuditEvent({
      action: "DELETE",
      module: "initiatives",
      entityType: "Initiative",
      entityId: existing.id,
      summary: `Удалена инициатива «${existing.title}»`,
      beforeData: {
        status: existing.status,
      },
      adminUserId: session.user.id,
      ...requestMeta,
    }),
    logAppEvent({
      group: "DOMAIN",
      severity: "WARN",
      module: "initiatives",
      message: `Initiative deleted: ${existing.id}`,
      adminUserId: session.user.id,
      ...requestMeta,
    }),
  ]);

  revalidatePath("/initiatives");
  revalidatePath("/admin");
  revalidatePath("/admin/initiatives");

  redirectWithSuccess("/admin/initiatives", "Инициатива удалена");
}
