import crypto from "node:crypto";

import {
  AppLogGroup,
  AuditAction,
  InitiativeStatus,
  LogSeverity,
  SecurityEventType,
  type Prisma,
} from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

const MAX_ACTIVE_ADMIN_SESSIONS = Math.max(1, Number(process.env.MAX_ACTIVE_ADMIN_SESSIONS ?? 3));

type RequestMeta = {
  requestId?: string | null;
  correlationId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  adminUserId?: string | null;
};

function safeIpForAnalytics(ipAddress?: string | null): string | null {
  if (!ipAddress) {
    return null;
  }

  if (ipAddress.includes(".")) {
    const chunks = ipAddress.split(".");
    if (chunks.length === 4) {
      return `${chunks[0]}.${chunks[1]}.${chunks[2]}.0`;
    }
  }

  if (ipAddress.includes(":")) {
    const chunks = ipAddress.split(":");
    return `${chunks.slice(0, 4).join(":")}:0000`;
  }

  return ipAddress;
}

function buildVisitorHash(sessionId: string, ipAddress?: string | null, userAgent?: string | null): string {
  const source = `${sessionId}:${safeIpForAnalytics(ipAddress) ?? "unknown"}:${userAgent ?? "unknown"}`;
  return crypto.createHash("sha256").update(source).digest("hex").slice(0, 32);
}

export async function logAppEvent(input: {
  group: AppLogGroup;
  severity?: LogSeverity;
  module: string;
  message: string;
  method?: string;
  path?: string;
  statusCode?: number;
  latencyMs?: number;
  metadata?: Prisma.InputJsonValue;
} & RequestMeta) {
  await prisma.appLog.create({
    data: {
      group: input.group,
      severity: input.severity ?? LogSeverity.INFO,
      module: input.module,
      message: input.message,
      method: input.method ?? null,
      path: input.path ?? null,
      statusCode: input.statusCode ?? null,
      latencyMs: input.latencyMs ?? null,
      requestId: input.requestId ?? null,
      correlationId: input.correlationId ?? null,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
      adminUserId: input.adminUserId ?? null,
      metadata: input.metadata ?? undefined,
    },
  });
}

export async function logAuditEvent(input: {
  action: AuditAction;
  module: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
  beforeData?: Prisma.InputJsonValue;
  afterData?: Prisma.InputJsonValue;
} & RequestMeta) {
  await prisma.auditLog.create({
    data: {
      action: input.action,
      module: input.module,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      summary: input.summary,
      beforeData: input.beforeData ?? undefined,
      afterData: input.afterData ?? undefined,
      actorUserId: input.adminUserId ?? null,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
      requestId: input.requestId ?? null,
      correlationId: input.correlationId ?? null,
    },
  });
}

export async function logSecurityEvent(input: {
  eventType: SecurityEventType;
  message: string;
  success: boolean;
  usernameAttempt?: string | null;
  metadata?: Prisma.InputJsonValue;
} & RequestMeta) {
  await prisma.securityEvent.create({
    data: {
      eventType: input.eventType,
      message: input.message,
      success: input.success,
      usernameAttempt: input.usernameAttempt ?? null,
      adminUserId: input.adminUserId ?? null,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
      requestId: input.requestId ?? null,
      metadata: input.metadata ?? undefined,
    },
  });
}

export async function trackTelemetryEvent(input: {
  category: string;
  eventType: string;
  path?: string;
  referrer?: string;
  sessionId?: string;
  durationMs?: number;
  value?: number;
  metadata?: Prisma.InputJsonValue;
} & RequestMeta) {
  const sessionId = input.sessionId ?? crypto.randomUUID();

  await prisma.telemetryEvent.create({
    data: {
      category: input.category,
      eventType: input.eventType,
      path: input.path ?? null,
      referrer: input.referrer ?? null,
      sessionId,
      visitorHash: buildVisitorHash(sessionId, input.ipAddress, input.userAgent),
      durationMs: input.durationMs ?? null,
      value: input.value ?? null,
      adminUserId: input.adminUserId ?? null,
      metadata: input.metadata ?? undefined,
    },
  });
}

export async function openAdminSession(input: {
  adminUserId: string;
  sessionToken: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  await prisma.$transaction(async (tx) => {
    await tx.adminSession.create({
      data: {
        adminUserId: input.adminUserId,
        sessionToken: input.sessionToken,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
      },
    });

    const activeSessions = await tx.adminSession.findMany({
      where: {
        adminUserId: input.adminUserId,
        revokedAt: null,
        endedAt: null,
      },
      select: {
        sessionToken: true,
      },
      orderBy: [{ startedAt: "desc" }],
    });

    const overflow = activeSessions.slice(MAX_ACTIVE_ADMIN_SESSIONS).map((session) => session.sessionToken);
    if (overflow.length === 0) {
      return;
    }

    const now = new Date();
    await tx.adminSession.updateMany({
      where: {
        sessionToken: {
          in: overflow,
        },
      },
      data: {
        revokedAt: now,
        endedAt: now,
        lastActivityAt: now,
      },
    });
  });
}

export async function touchAdminSession(sessionToken: string) {
  await prisma.adminSession.updateMany({
    where: {
      sessionToken,
      revokedAt: null,
      endedAt: null,
    },
    data: {
      lastActivityAt: new Date(),
    },
  });
}

export async function closeAdminSession(sessionToken: string) {
  const now = new Date();
  await prisma.adminSession.updateMany({
    where: {
      sessionToken,
      revokedAt: null,
      endedAt: null,
    },
    data: {
      endedAt: now,
      lastActivityAt: now,
    },
  });
}

export async function revokeAdminSession(sessionToken: string) {
  const now = new Date();
  await prisma.adminSession.updateMany({
    where: {
      sessionToken,
      revokedAt: null,
    },
    data: {
      revokedAt: now,
      endedAt: now,
      lastActivityAt: now,
    },
  });
}

export async function setInitiativeStatus(
  initiativeId: string,
  nextStatus: InitiativeStatus,
  adminUserId?: string,
) {
  const existing = await prisma.initiative.findUnique({ where: { id: initiativeId } });
  if (!existing || existing.status === nextStatus) {
    return existing;
  }

  const updated = await prisma.initiative.update({
    where: { id: initiativeId },
    data: {
      status: nextStatus,
      implementedAt: nextStatus === InitiativeStatus.IMPLEMENTED ? new Date() : existing.implementedAt,
    },
  });

  await prisma.initiativeNote.create({
    data: {
      initiativeId,
      authorId: adminUserId ?? null,
      note: `Статус изменён: ${existing.status} -> ${nextStatus}`,
      isStatusChange: true,
      fromStatus: existing.status,
      toStatus: nextStatus,
    },
  });

  return updated;
}

export async function getObservabilityOverview(days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [
    totalLogs,
    totalAudit,
    totalSecurity,
    totalTelemetry,
    errorLogs,
    topPages,
    latestLogs,
    latestAudit,
    latestSecurity,
  ] = await Promise.all([
    prisma.appLog.count({ where: { createdAt: { gte: since } } }),
    prisma.auditLog.count({ where: { createdAt: { gte: since } } }),
    prisma.securityEvent.count({ where: { createdAt: { gte: since } } }),
    prisma.telemetryEvent.count({ where: { createdAt: { gte: since } } }),
    prisma.appLog.count({
      where: {
        createdAt: { gte: since },
        severity: { in: [LogSeverity.ERROR, LogSeverity.CRITICAL] },
      },
    }),
    prisma.telemetryEvent.groupBy({
      by: ["path"],
      where: {
        createdAt: { gte: since },
        path: { not: null },
      },
      _count: {
        _all: true,
      },
      orderBy: {
        _count: {
          path: "desc",
        },
      },
      take: 8,
    }),
    prisma.appLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { adminUser: { select: { username: true, role: true } } },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { actorUser: { select: { username: true, role: true } } },
    }),
    prisma.securityEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { adminUser: { select: { username: true, role: true } } },
    }),
  ]);

  return {
    counters: {
      totalLogs,
      totalAudit,
      totalSecurity,
      totalTelemetry,
      errorLogs,
    },
    topPages: topPages
      .filter((item) => Boolean(item.path))
      .map((item) => ({
        path: item.path ?? "",
        hits: item._count._all,
      })),
    latestLogs,
    latestAudit,
    latestSecurity,
  };
}

export async function getTrafficOverview(days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [
    totalEvents,
    uniqueVisitors,
    sessions,
    pageViews,
    downloads,
    ideaCtaClicks,
    popularNews,
    popularMinistries,
  ] = await Promise.all([
    prisma.telemetryEvent.count({ where: { createdAt: { gte: since } } }),
    prisma.telemetryEvent.groupBy({
      by: ["visitorHash"],
      where: {
        createdAt: { gte: since },
        visitorHash: { not: null },
      },
      _count: { _all: true },
    }),
    prisma.telemetryEvent.groupBy({
      by: ["sessionId"],
      where: {
        createdAt: { gte: since },
        sessionId: { not: null },
      },
      _count: { _all: true },
    }),
    prisma.telemetryEvent.count({
      where: {
        createdAt: { gte: since },
        eventType: "page_view",
      },
    }),
    prisma.telemetryEvent.count({
      where: {
        createdAt: { gte: since },
        eventType: "document_download",
      },
    }),
    prisma.telemetryEvent.count({
      where: {
        createdAt: { gte: since },
        eventType: "idea_cta_click",
      },
    }),
    prisma.telemetryEvent.groupBy({
      by: ["path"],
      where: {
        createdAt: { gte: since },
        path: {
          startsWith: "/news",
        },
      },
      _count: { _all: true },
      take: 5,
      orderBy: {
        _count: {
          path: "desc",
        },
      },
    }),
    prisma.telemetryEvent.groupBy({
      by: ["path"],
      where: {
        createdAt: { gte: since },
        path: {
          startsWith: "/ministries",
        },
      },
      _count: { _all: true },
      take: 5,
      orderBy: {
        _count: {
          path: "desc",
        },
      },
    }),
  ]);

  return {
    totalEvents,
    uniqueVisitors: uniqueVisitors.length,
    sessions: sessions.length,
    pageViews,
    downloads,
    ideaCtaClicks,
    popularNews: popularNews.map((item) => ({ path: item.path ?? "", hits: item._count._all })),
    popularMinistries: popularMinistries.map((item) => ({ path: item.path ?? "", hits: item._count._all })),
  };
}

