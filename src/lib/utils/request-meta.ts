import { headers } from "next/headers";

export type RequestMeta = {
  requestId?: string;
  correlationId?: string;
  ipAddress?: string;
  userAgent?: string;
};

function normalizeIp(raw: string | null): string | undefined {
  if (!raw) {
    return undefined;
  }

  return raw.split(",")[0]?.trim();
}

export async function getRequestMeta(): Promise<RequestMeta> {
  const headerStore = await headers();

  return {
    requestId: headerStore.get("x-request-id") ?? undefined,
    correlationId: headerStore.get("x-correlation-id") ?? undefined,
    ipAddress: normalizeIp(headerStore.get("x-forwarded-for")) ?? headerStore.get("x-real-ip") ?? undefined,
    userAgent: headerStore.get("user-agent") ?? undefined,
  };
}
