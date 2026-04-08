"use server";

import { revalidatePath } from "next/cache";

import { createEvent, deleteEvent, getEventById, updateEvent } from "@/features/events/service";
import { logAppEvent, logAuditEvent } from "@/features/observability/service";
import { requireAdminSession } from "@/lib/auth/session";
import { eventSchema } from "@/lib/validators/events";
import { getFormStringValue, redirectWithError, redirectWithSuccess } from "@/lib/utils/admin-action";
import { getRequestMeta } from "@/lib/utils/request-meta";

const mutatingRoles = ["CHIEF_ADMIN", "ADMIN", "EDITOR", "MINISTRY_EDITOR"] as const;

function parseEventInput(formData: FormData) {
  return eventSchema.safeParse({
    title: getFormStringValue(formData, "title"),
    description: getFormStringValue(formData, "description"),
    category: getFormStringValue(formData, "category"),
    organizer: getFormStringValue(formData, "organizer"),
    location: getFormStringValue(formData, "location"),
    startAt: getFormStringValue(formData, "startAt"),
    endAt: getFormStringValue(formData, "endAt"),
    status: getFormStringValue(formData, "status"),
    ministryId: getFormStringValue(formData, "ministryId"),
  });
}

export async function createEventAction(formData: FormData) {
  const session = await requireAdminSession([...mutatingRoles]);
  const requestMeta = await getRequestMeta();

  const parsed = parseEventInput(formData);
  if (!parsed.success) {
    redirectWithError("/admin/events/new", parsed.error.issues[0]?.message ?? "Ошибка валидации");
  }

  const event = await createEvent(parsed.data, session.user.id);

  await Promise.all([
    logAuditEvent({
      action: "CREATE",
      module: "events",
      entityType: "Event",
      entityId: event.id,
      summary: `Создано событие В«${event.title}В»`,
      afterData: {
        title: event.title,
        status: event.status,
        category: event.category,
      },
      adminUserId: session.user.id,
      ...requestMeta,
    }),
    logAppEvent({
      group: "DOMAIN",
      severity: "INFO",
      module: "events",
      message: `Event created: ${event.id}`,
      adminUserId: session.user.id,
      ...requestMeta,
    }),
  ]);

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/admin/events");

  redirectWithSuccess("/admin/events", "Событие создано");
}

export async function updateEventAction(id: string, formData: FormData) {
  const session = await requireAdminSession([...mutatingRoles]);
  const requestMeta = await getRequestMeta();

  const existing = await getEventById(id);
  if (!existing) {
    redirectWithError("/admin/events", "Событие не найдено");
  }

  const parsed = parseEventInput(formData);
  if (!parsed.success) {
    redirectWithError(`/admin/events/${id}`, parsed.error.issues[0]?.message ?? "Ошибка валидации");
  }

  const updated = await updateEvent(id, parsed.data);

  await Promise.all([
    logAuditEvent({
      action: "UPDATE",
      module: "events",
      entityType: "Event",
      entityId: updated.id,
      summary: `Обновлено событие В«${updated.title}В»`,
      beforeData: {
        title: existing.title,
        status: existing.status,
        category: existing.category,
      },
      afterData: {
        title: updated.title,
        status: updated.status,
        category: updated.category,
      },
      adminUserId: session.user.id,
      ...requestMeta,
    }),
    logAppEvent({
      group: "DOMAIN",
      severity: "INFO",
      module: "events",
      message: `Event updated: ${updated.id}`,
      adminUserId: session.user.id,
      ...requestMeta,
    }),
  ]);

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath(`/events/${existing.slug}`);
  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${id}`);

  redirectWithSuccess("/admin/events", "Событие обновлено");
}

export async function deleteEventAction(id: string) {
  const session = await requireAdminSession([...mutatingRoles]);
  const requestMeta = await getRequestMeta();

  const existing = await getEventById(id);
  if (!existing) {
    redirectWithError("/admin/events", "Событие не найдено");
  }

  await deleteEvent(id);

  await Promise.all([
    logAuditEvent({
      action: "DELETE",
      module: "events",
      entityType: "Event",
      entityId: existing.id,
      summary: `Удалено событие В«${existing.title}В»`,
      beforeData: {
        title: existing.title,
        status: existing.status,
      },
      adminUserId: session.user.id,
      ...requestMeta,
    }),
    logAppEvent({
      group: "DOMAIN",
      severity: "WARN",
      module: "events",
      message: `Event deleted: ${existing.id}`,
      adminUserId: session.user.id,
      ...requestMeta,
    }),
  ]);

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/admin/events");

  redirectWithSuccess("/admin/events", "Событие удалено");
}

