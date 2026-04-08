"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { logAppEvent, logAuditEvent, revokeAdminSession } from "@/features/observability/service";
import { hashPassword } from "@/lib/auth/password";
import { requireAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { getFormStringValue, redirectWithError, redirectWithSuccess } from "@/lib/utils/admin-action";
import { getRequestMeta } from "@/lib/utils/request-meta";

const createUserSchema = z.object({
  username: z.string().trim().min(3, "Укажите логин"),
  email: z.string().trim().email("Некорректный email").optional().or(z.literal("")),
  password: z.string().min(8, "Минимальная длина пароля — 8 символов"),
  role: z.enum(["CHIEF_ADMIN", "ADMIN", "EDITOR", "MINISTRY_EDITOR", "ANALYST"]),
});

const updateUserSchema = z.object({
  role: z.enum(["CHIEF_ADMIN", "ADMIN", "EDITOR", "MINISTRY_EDITOR", "ANALYST"]),
  status: z.enum(["ACTIVE", "DISABLED"]),
});

export async function createAdminUserAction(formData: FormData) {
  const session = await requireAdminSession(["CHIEF_ADMIN"]);
  const requestMeta = await getRequestMeta();

  const parsed = createUserSchema.safeParse({
    username: getFormStringValue(formData, "username"),
    email: getFormStringValue(formData, "email"),
    password: getFormStringValue(formData, "password"),
    role: getFormStringValue(formData, "role"),
  });

  if (!parsed.success) {
    redirectWithError("/admin/users", parsed.error.issues[0]?.message ?? "Ошибка валидации");
  }

  const existing = await prisma.adminUser.findFirst({
    where: {
      OR: [
        { username: parsed.data.username },
        ...(parsed.data.email ? [{ email: parsed.data.email }] : []),
      ],
    },
  });

  if (existing) {
    redirectWithError("/admin/users", "Пользователь с такими данными уже существует");
  }

  const passwordHash = await hashPassword(parsed.data.password);

  const user = await prisma.adminUser.create({
    data: {
      username: parsed.data.username,
      email: parsed.data.email || null,
      passwordHash,
      role: parsed.data.role,
      status: "ACTIVE",
    },
  });

  await Promise.all([
    logAuditEvent({
      action: "CREATE",
      module: "users",
      entityType: "AdminUser",
      entityId: user.id,
      summary: `Создан админ-пользователь ${user.username}`,
      afterData: {
        role: user.role,
        status: user.status,
      },
      adminUserId: session.user.id,
      ...requestMeta,
    }),
    logAppEvent({
      group: "AUTH",
      severity: "INFO",
      module: "users",
      message: `Admin user created: ${user.id}`,
      adminUserId: session.user.id,
      ...requestMeta,
    }),
  ]);

  revalidatePath("/admin/users");
  redirectWithSuccess("/admin/users", "Пользователь создан");
}

export async function updateAdminUserAction(userId: string, formData: FormData) {
  const session = await requireAdminSession(["CHIEF_ADMIN"]);
  const requestMeta = await getRequestMeta();

  const parsed = updateUserSchema.safeParse({
    role: getFormStringValue(formData, "role"),
    status: getFormStringValue(formData, "status"),
  });

  if (!parsed.success) {
    redirectWithError("/admin/users", parsed.error.issues[0]?.message ?? "Ошибка валидации");
  }

  const existing = await prisma.adminUser.findUnique({ where: { id: userId } });
  if (!existing) {
    redirectWithError("/admin/users", "Пользователь не найден");
  }

  if (existing.id === session.user.id && parsed.data.status === "DISABLED") {
    redirectWithError("/admin/users", "Нельзя отключить собственную учетную запись");
  }

  const updated = await prisma.adminUser.update({
    where: { id: userId },
    data: {
      role: parsed.data.role,
      status: parsed.data.status,
    },
  });

  await logAuditEvent({
    action: "UPDATE",
    module: "users",
    entityType: "AdminUser",
    entityId: updated.id,
    summary: `Обновлен профиль пользователя ${updated.username}`,
    beforeData: {
      role: existing.role,
      status: existing.status,
    },
    afterData: {
      role: updated.role,
      status: updated.status,
    },
    adminUserId: session.user.id,
    ...requestMeta,
  });

  revalidatePath("/admin/users");
  redirectWithSuccess("/admin/users", "Пользователь обновлен");
}

export async function revokeSessionAction(sessionToken: string) {
  const session = await requireAdminSession(["CHIEF_ADMIN"]);
  const requestMeta = await getRequestMeta();

  await revokeAdminSession(sessionToken);

  await logAppEvent({
    group: "SECURITY",
    severity: "WARN",
    module: "sessions",
    message: "Admin session revoked",
    adminUserId: session.user.id,
    metadata: {
      sessionToken,
    },
    ...requestMeta,
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/observability");
  redirectWithSuccess("/admin/users", "Сессия отозвана");
}

