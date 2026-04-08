import crypto from "node:crypto";

import type { AccountStatus, AdminRole } from "@prisma/client";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";

import { verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";
import {
  closeAdminSession,
  logAppEvent,
  logSecurityEvent,
  openAdminSession,
  touchAdminSession,
} from "@/features/observability/service";

const loginSchema = z.object({
  username: z.string().trim().min(3, "Укажите логин"),
  password: z.string().min(6, "Укажите пароль"),
});

const LOGIN_WINDOW_MINUTES = Math.max(1, Number(process.env.AUTH_LOGIN_WINDOW_MINUTES ?? 15));
const MAX_FAILED_ATTEMPTS_PER_IP = Math.max(1, Number(process.env.AUTH_MAX_FAILED_ATTEMPTS_PER_IP ?? 12));
const MAX_FAILED_ATTEMPTS_PER_USERNAME = Math.max(1, Number(process.env.AUTH_MAX_FAILED_ATTEMPTS_PER_USERNAME ?? 6));

function readHeader(req: unknown, headerName: string): string | undefined {
  const headers = (req as { headers?: unknown })?.headers;
  if (!headers) {
    return undefined;
  }

  if (typeof (headers as { get?: unknown }).get === "function") {
    return ((headers as { get: (name: string) => string | null }).get(headerName) ?? undefined) as
      | string
      | undefined;
  }

  const lower = headerName.toLowerCase();
  const raw = (headers as Record<string, unknown>)[lower] ?? (headers as Record<string, unknown>)[headerName];

  if (typeof raw === "string") {
    return raw;
  }

  if (Array.isArray(raw) && typeof raw[0] === "string") {
    return raw[0];
  }

  return undefined;
}

function resolveIp(req: unknown): string | undefined {
  const forwardedFor = readHeader(req, "x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim();
  }

  return readHeader(req, "x-real-ip");
}

async function safeObserve(fn: () => Promise<void>) {
  try {
    await fn();
  } catch {
    // do not block auth on observability failures
  }
}

async function getRecentFailedAttempts(input: {
  username?: string;
  ipAddress?: string;
  since: Date;
}) {
  const [usernameFailures, ipFailures] = await Promise.all([
    input.username
      ? prisma.securityEvent.count({
          where: {
            eventType: "LOGIN_FAILURE",
            createdAt: { gte: input.since },
            usernameAttempt: input.username,
          },
        })
      : Promise.resolve(0),
    input.ipAddress
      ? prisma.securityEvent.count({
          where: {
            eventType: "LOGIN_FAILURE",
            createdAt: { gte: input.since },
            ipAddress: input.ipAddress,
          },
        })
      : Promise.resolve(0),
  ]);

  return {
    usernameFailures,
    ipFailures,
  };
}

async function isLoginRateLimited(input: {
  username: string;
  ipAddress?: string;
}) {
  const since = new Date(Date.now() - LOGIN_WINDOW_MINUTES * 60 * 1000);
  const { usernameFailures, ipFailures } = await getRecentFailedAttempts({
    username: input.username,
    ipAddress: input.ipAddress,
    since,
  });

  return {
    since,
    usernameFailures,
    ipFailures,
    limitedByUsername: usernameFailures >= MAX_FAILED_ATTEMPTS_PER_USERNAME,
    limitedByIp: ipFailures >= MAX_FAILED_ATTEMPTS_PER_IP,
  };
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Администратор",
      credentials: {
        username: { label: "Логин", type: "text" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials, req) {
        const parsed = loginSchema.safeParse(credentials);
        const ipAddress = resolveIp(req);
        const userAgent = readHeader(req, "user-agent");
        const requestId = readHeader(req, "x-request-id");
        const correlationId = readHeader(req, "x-correlation-id") ?? requestId;

        if (!parsed.success) {
          await safeObserve(() =>
            logSecurityEvent({
              eventType: "LOGIN_FAILURE",
              message: "Невалидный payload для входа",
              success: false,
              usernameAttempt: typeof credentials?.username === "string" ? credentials.username : null,
              ipAddress,
              userAgent,
              requestId,
              correlationId,
            }),
          );
          return null;
        }

        const rateLimit = await isLoginRateLimited({
          username: parsed.data.username,
          ipAddress,
        });
        if (rateLimit.limitedByIp || rateLimit.limitedByUsername) {
          await safeObserve(() =>
            logSecurityEvent({
              eventType: "SUSPICIOUS_ACTIVITY",
              message: "Вход временно ограничен из-за большого числа неуспешных попыток",
              success: false,
              usernameAttempt: parsed.data.username,
              ipAddress,
              userAgent,
              requestId,
              correlationId,
              metadata: {
                windowMinutes: LOGIN_WINDOW_MINUTES,
                usernameFailures: rateLimit.usernameFailures,
                ipFailures: rateLimit.ipFailures,
                maxUsernameFailures: MAX_FAILED_ATTEMPTS_PER_USERNAME,
                maxIpFailures: MAX_FAILED_ATTEMPTS_PER_IP,
              },
            }),
          );
          return null;
        }

        const user = await prisma.adminUser.findUnique({
          where: { username: parsed.data.username },
        });

        if (!user || user.status === "DISABLED") {
          await safeObserve(() =>
            logSecurityEvent({
              eventType: "LOGIN_FAILURE",
              message: "Попытка входа для несуществующей или отключенной учетной записи",
              success: false,
              usernameAttempt: parsed.data.username,
              ipAddress,
              userAgent,
              requestId,
              correlationId,
            }),
          );
          return null;
        }

        const isValid = await verifyPassword(parsed.data.password, user.passwordHash);
        if (!isValid) {
          await safeObserve(() =>
            logSecurityEvent({
              eventType: "LOGIN_FAILURE",
              message: "Неверный пароль",
              success: false,
              usernameAttempt: parsed.data.username,
              adminUserId: user.id,
              ipAddress,
              userAgent,
              requestId,
              correlationId,
            }),
          );
          return null;
        }

        await prisma.adminUser.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
          },
        });

        await safeObserve(async () => {
          await Promise.all([
            logSecurityEvent({
              eventType: "LOGIN_SUCCESS",
              message: "Успешная авторизация администратора",
              success: true,
              usernameAttempt: parsed.data.username,
              adminUserId: user.id,
              ipAddress,
              userAgent,
              requestId,
              correlationId,
            }),
            logAppEvent({
              group: "AUTH",
              severity: "INFO",
              module: "next-auth",
              message: `Пользователь ${user.username} вошёл в систему`,
              method: "POST",
              path: "/api/auth/callback/credentials",
              ipAddress,
              userAgent,
              requestId,
              correlationId,
              adminUserId: user.id,
            }),
          ]);
        });

        return {
          id: user.id,
          name: user.username,
          role: user.role,
          status: user.status,
          ipAddress,
          userAgent,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        const sessionToken = crypto.randomUUID();
        token.sessionToken = sessionToken;

        await safeObserve(() =>
          openAdminSession({
            adminUserId: user.id,
            sessionToken,
            ipAddress: (user as { ipAddress?: string }).ipAddress ?? null,
            userAgent: (user as { userAgent?: string }).userAgent ?? null,
          }),
        );
      }

      if (token.sessionToken) {
        await safeObserve(() => touchAdminSession(token.sessionToken as string));
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as AdminRole | undefined) ?? "ADMIN";
        session.user.status = (token.status as AccountStatus | undefined) ?? "ACTIVE";
        session.user.sessionToken = (token.sessionToken as string | undefined) ?? "";
      }

      return session;
    },
  },
  events: {
    async signOut({ token }) {
      const sessionToken = token?.sessionToken as string | undefined;

      if (!sessionToken) {
        return;
      }

      await safeObserve(async () => {
        await Promise.all([
          closeAdminSession(sessionToken),
          logSecurityEvent({
            eventType: "LOGOUT",
            message: "Выход из административной панели",
            success: true,
            adminUserId: (token?.id as string | undefined) ?? null,
          }),
        ]);
      });
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

