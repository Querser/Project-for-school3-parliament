import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

import { logAppEvent, trackTelemetryEvent } from "@/features/observability/service";
import { getRequestMeta } from "@/lib/utils/request-meta";

export const dynamic = "force-dynamic";

const payloadSchema = z.object({
  category: z.string().trim().min(1).max(80),
  eventType: z.string().trim().min(1).max(120),
  path: z.string().trim().max(500).optional(),
  referrer: z.string().trim().max(500).optional(),
  sessionId: z.string().trim().max(180).optional(),
  durationMs: z.coerce.number().int().nonnegative().optional(),
  value: z.coerce.number().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  const startedAt = Date.now();
  const requestMeta = await getRequestMeta();

  try {
    const json = await request.json();
    const parsed = payloadSchema.safeParse(json);

    if (!parsed.success) {
      await logAppEvent({
        group: "SYSTEM",
        severity: "WARN",
        module: "telemetry-api",
        message: "Invalid telemetry payload",
        method: "POST",
        path: "/api/telemetry",
        statusCode: 400,
        latencyMs: Date.now() - startedAt,
        metadata: {
          issues: parsed.error.issues.map((issue) => issue.message),
        },
        ...requestMeta,
      });

      return NextResponse.json({ message: "Некорректный payload" }, { status: 400 });
    }

    await trackTelemetryEvent({
      category: parsed.data.category,
      eventType: parsed.data.eventType,
      path: parsed.data.path,
      referrer: parsed.data.referrer,
      sessionId: parsed.data.sessionId,
      durationMs: parsed.data.durationMs,
      value: parsed.data.value,
      metadata: parsed.data.metadata as Prisma.InputJsonValue | undefined,
      ...requestMeta,
    });

    await logAppEvent({
      group: "HTTP",
      severity: "INFO",
      module: "telemetry-api",
      message: "Telemetry event accepted",
      method: "POST",
      path: "/api/telemetry",
      statusCode: 202,
      latencyMs: Date.now() - startedAt,
      ...requestMeta,
    });

    return NextResponse.json({ ok: true }, { status: 202 });
  } catch (error) {
    await logAppEvent({
      group: "SYSTEM",
      severity: "ERROR",
      module: "telemetry-api",
      message: "Telemetry endpoint failed",
      method: "POST",
      path: "/api/telemetry",
      statusCode: 500,
      latencyMs: Date.now() - startedAt,
      metadata: {
        error: error instanceof Error ? error.message : "unknown",
      },
      ...requestMeta,
    });

    return NextResponse.json({ message: "Ошибка сервера" }, { status: 500 });
  }
}



