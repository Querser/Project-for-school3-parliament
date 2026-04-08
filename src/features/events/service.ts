import type { EventStatus } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { generateUniqueSlug } from "@/lib/utils/slug";
import type { EventInput } from "@/lib/validators/events";

async function syncCompletedEvents(now = new Date()) {
  const dueEvents = await prisma.event.findMany({
    where: {
      status: "PLANNED",
      OR: [
        { endAt: { lte: now } },
        {
          endAt: null,
          startAt: { lte: now },
        },
      ],
    },
    select: { id: true },
  });

  if (dueEvents.length === 0) {
    return;
  }

  await prisma.event.updateMany({
    where: {
      id: {
        in: dueEvents.map((item) => item.id),
      },
    },
    data: {
      status: "COMPLETED",
    },
  });
}

export async function getUpcomingEvents(limit = 5) {
  await syncCompletedEvents();

  return prisma.event.findMany({
    where: {
      status: "PLANNED",
      startAt: {
        gte: new Date(),
      },
    },
    include: {
      ministry: true,
    },
    orderBy: [{ startAt: "asc" }],
    take: limit,
  });
}

export async function getPublicEvents() {
  await syncCompletedEvents();

  const events = await prisma.event.findMany({
    include: {
      ministry: true,
    },
    orderBy: [{ startAt: "asc" }],
  });

  return events.sort((left, right) => {
    const statusPriority = {
      PLANNED: 0,
      CANCELLED: 1,
      COMPLETED: 2,
    } as const;

    if (left.status !== right.status) {
      return statusPriority[left.status] - statusPriority[right.status];
    }

    if (left.status === "PLANNED") {
      return left.startAt.getTime() - right.startAt.getTime();
    }

    return right.startAt.getTime() - left.startAt.getTime();
  });
}

export async function getEventBySlug(slug: string) {
  await syncCompletedEvents();

  return prisma.event.findUnique({
    where: { slug },
    include: {
      ministry: true,
    },
  });
}

export async function getEventById(id: string) {
  return prisma.event.findUnique({ where: { id } });
}

export async function getEventsAdminList() {
  await syncCompletedEvents();

  return prisma.event.findMany({
    include: {
      ministry: true,
      _count: {
        select: {
          news: true,
        },
      },
    },
    orderBy: [{ startAt: "desc" }],
  });
}

function normalizeEndDate(startAt: string, endAt?: string | null): Date | null {
  if (!endAt) {
    return null;
  }

  const start = new Date(startAt);
  const end = new Date(endAt);

  if (end.getTime() < start.getTime()) {
    return start;
  }

  return end;
}

export async function createEvent(input: EventInput, createdById?: string) {
  const slug = await generateUniqueSlug(input.title, async (value) => {
    const existing = await prisma.event.findUnique({ where: { slug: value }, select: { id: true } });
    return Boolean(existing);
  });

  return prisma.event.create({
    data: {
      title: input.title,
      slug,
      description: input.description,
      category: input.category,
      organizer: input.organizer || null,
      location: input.location || null,
      startAt: new Date(input.startAt),
      endAt: normalizeEndDate(input.startAt, input.endAt || null),
      status: input.status as EventStatus,
      ministryId: input.ministryId || null,
      createdById: createdById ?? null,
    },
  });
}

export async function updateEvent(id: string, input: EventInput) {
  const slug = await generateUniqueSlug(input.title, async (value) => {
    const existing = await prisma.event.findFirst({
      where: {
        slug: value,
        NOT: { id },
      },
      select: { id: true },
    });

    return Boolean(existing);
  });

  return prisma.event.update({
    where: { id },
    data: {
      title: input.title,
      slug,
      description: input.description,
      category: input.category,
      organizer: input.organizer || null,
      location: input.location || null,
      startAt: new Date(input.startAt),
      endAt: normalizeEndDate(input.startAt, input.endAt || null),
      status: input.status as EventStatus,
      ministryId: input.ministryId || null,
    },
  });
}

export async function deleteEvent(id: string) {
  return prisma.event.delete({ where: { id } });
}
