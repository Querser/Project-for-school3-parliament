import type { InitiativePriority, InitiativeStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import type { InitiativeInput } from "@/lib/validators/initiatives";

export async function getPublicShowcaseInitiatives() {
  return prisma.initiative.findMany({
    where: {
      publicShowcase: true,
      status: "IMPLEMENTED",
    },
    include: {
      assignedMinistry: true,
    },
    orderBy: [{ implementedAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function getInitiativesAdminList() {
  return prisma.initiative.findMany({
    include: {
      assignedMinistry: true,
      assignedAdmin: true,
      notes: {
        orderBy: [{ createdAt: "desc" }],
        take: 1,
      },
    },
    orderBy: [{ updatedAt: "desc" }],
  });
}

export async function getInitiativeById(id: string) {
  return prisma.initiative.findUnique({
    where: { id },
    include: {
      assignedMinistry: true,
      assignedAdmin: true,
      notes: {
        include: {
          author: true,
        },
        orderBy: [{ createdAt: "desc" }],
      },
    },
  });
}

interface InitiativeCreatePayload {
  input: InitiativeInput;
  attachmentPath?: string | null;
  attachmentMimeType?: string | null;
  attachmentSize?: number | null;
}

function normalizePublicShowcase(status: InitiativeStatus, requestedPublicShowcase: boolean) {
  if (status !== "IMPLEMENTED") {
    return false;
  }

  return requestedPublicShowcase;
}

function resolveImplementedAt(status: InitiativeStatus, currentImplementedAt?: Date | null): Date | null {
  if (status === "IMPLEMENTED") {
    return currentImplementedAt ?? new Date();
  }

  return null;
}

export async function createInitiative(payload: InitiativeCreatePayload) {
  return prisma.initiative.create({
    data: {
      title: payload.input.title,
      description: payload.input.description,
      submitterName: payload.input.submitterName || null,
      submitterContact: payload.input.submitterContact || null,
      submitterClass: payload.input.submitterClass || null,
      isAnonymous: payload.input.isAnonymous,
      status: payload.input.status as InitiativeStatus,
      priority: payload.input.priority as InitiativePriority,
      assignedMinistryId: payload.input.assignedMinistryId || null,
      assignedAdminId: payload.input.assignedAdminId || null,
      publicShowcase: normalizePublicShowcase(payload.input.status as InitiativeStatus, payload.input.publicShowcase),
      implementedAt: resolveImplementedAt(payload.input.status as InitiativeStatus),
      attachmentPath: payload.attachmentPath ?? null,
      attachmentMimeType: payload.attachmentMimeType ?? null,
      attachmentSize: payload.attachmentSize ?? null,
    },
  });
}

export async function updateInitiative(id: string, payload: InitiativeCreatePayload) {
  const existing = await prisma.initiative.findUnique({ where: { id } });
  if (!existing) {
    return null;
  }

  const data: Prisma.InitiativeUncheckedUpdateInput = {
    title: payload.input.title,
    description: payload.input.description,
    submitterName: payload.input.submitterName || null,
    submitterContact: payload.input.submitterContact || null,
    submitterClass: payload.input.submitterClass || null,
    isAnonymous: payload.input.isAnonymous,
    status: payload.input.status as InitiativeStatus,
    priority: payload.input.priority as InitiativePriority,
    assignedMinistryId: payload.input.assignedMinistryId || null,
    assignedAdminId: payload.input.assignedAdminId || null,
    publicShowcase: normalizePublicShowcase(payload.input.status as InitiativeStatus, payload.input.publicShowcase),
    implementedAt: resolveImplementedAt(payload.input.status as InitiativeStatus, existing.implementedAt),
  };

  if (payload.attachmentPath !== undefined) {
    data.attachmentPath = payload.attachmentPath;
    data.attachmentMimeType = payload.attachmentMimeType ?? null;
    data.attachmentSize = payload.attachmentSize ?? null;
  }

  return prisma.initiative.update({
    where: { id },
    data,
  });
}

export async function submitPublicInitiative(payload: {
  title: string;
  description: string;
  submitterName?: string;
  submitterContact?: string;
  submitterClass?: string;
  attachmentPath?: string | null;
  attachmentMimeType?: string | null;
  attachmentSize?: number | null;
}) {
  return prisma.initiative.create({
    data: {
      title: payload.title,
      description: payload.description,
      submitterName: payload.submitterName || null,
      submitterContact: payload.submitterContact || null,
      submitterClass: payload.submitterClass || null,
      isAnonymous: false,
      status: "NEW",
      priority: "MEDIUM",
      publicShowcase: false,
      attachmentPath: payload.attachmentPath ?? null,
      attachmentMimeType: payload.attachmentMimeType ?? null,
      attachmentSize: payload.attachmentSize ?? null,
    },
  });
}

export async function addInitiativeNote(input: {
  initiativeId: string;
  authorId?: string | null;
  note: string;
  isStatusChange?: boolean;
  fromStatus?: InitiativeStatus | null;
  toStatus?: InitiativeStatus | null;
}) {
  return prisma.initiativeNote.create({
    data: {
      initiativeId: input.initiativeId,
      authorId: input.authorId ?? null,
      note: input.note,
      isStatusChange: input.isStatusChange ?? false,
      fromStatus: input.fromStatus ?? null,
      toStatus: input.toStatus ?? null,
    },
  });
}

export async function deleteInitiative(id: string) {
  return prisma.initiative.delete({ where: { id } });
}
