import crypto from "node:crypto";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function generateRequestId(): string {
  return crypto.randomUUID();
}

export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const requestId = requestHeaders.get("x-request-id") ?? generateRequestId();
  const correlationId = requestHeaders.get("x-correlation-id") ?? requestId;

  requestHeaders.set("x-request-id", requestId);
  requestHeaders.set("x-correlation-id", correlationId);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("x-request-id", requestId);
  response.headers.set("x-correlation-id", correlationId);

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
