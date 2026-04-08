import type { AdminRole } from "@prisma/client";
import Link from "next/link";

import { LogoutButton } from "@/components/admin/logout-button";
import { AccessibilityControls } from "@/components/public/accessibility-controls";
import { getVisibleNavItems } from "@/lib/auth/permissions";
import { getAdminRoleLabel } from "@/lib/utils/status";

export function AdminSidebar({
  username,
  role,
}: {
  username?: string | null;
  role: AdminRole;
}) {
  const navItems = getVisibleNavItems(role);

  return (
    <aside className="w-full border-b border-slate-200 bg-white md:min-h-screen md:w-72 md:border-b-0 md:border-r">
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Админ-панель</h2>
          <p className="text-xs text-slate-600">{username ? `Вход: ${username}` : "Администратор"}</p>
          <p className="text-xs text-slate-600">Роль: {getAdminRoleLabel(role)}</p>
        </div>

        <AccessibilityControls />

        <nav className="grid gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div>
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}


