import type { AdminRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth/auth-options";
import { canAccessSection, type AdminSection } from "@/lib/auth/permissions";

export async function getOptionalSession() {
  return getServerSession(authOptions);
}

export async function requireAdminSession(allowedRoles?: AdminRole[]) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.status !== "ACTIVE") {
    redirect("/admin/login");
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(session.user.role)) {
    redirect("/admin/login");
  }

  return session;
}

export async function requireSectionAccess(section: AdminSection) {
  const session = await requireAdminSession();
  if (!canAccessSection(session.user.role, section)) {
    redirect("/admin");
  }

  return session;
}
