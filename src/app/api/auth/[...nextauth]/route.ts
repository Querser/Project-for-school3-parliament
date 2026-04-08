import NextAuth from "next-auth";

import { authOptions } from "@/lib/auth/auth-options";

const handler = NextAuth(authOptions);

export async function GET(request: Request, context: unknown) {
  return handler(request, context as never);
}

export async function POST(request: Request, context: unknown) {
  return handler(request, context as never);
}
