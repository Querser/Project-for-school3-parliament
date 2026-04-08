import path from "node:path";

import mime from "mime-types";
import { NextResponse } from "next/server";

import { storage } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const params = await context.params;
  const pathSegments = params.path ?? [];

  const requestedPath = pathSegments.map((segment) => decodeURIComponent(segment)).join("/");
  const normalized = path.posix.normalize(requestedPath).replace(/^\/+/, "");

  if (!normalized || normalized.startsWith("..") || !normalized.startsWith("uploads/")) {
    return NextResponse.json({ message: "Файл не найден" }, { status: 404 });
  }

  try {
    const file = await storage.readFile(normalized);
    const contentType = mime.lookup(normalized) || "application/octet-stream";
    const resolvedContentType =
      typeof contentType === "string" && contentType.startsWith("text/")
        ? `${contentType}; charset=utf-8`
        : typeof contentType === "string"
          ? contentType
          : "application/octet-stream";

    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": resolvedContentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ message: "Файл не найден" }, { status: 404 });
  }
}
