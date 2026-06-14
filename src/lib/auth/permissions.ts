import type { AdminRole } from "@prisma/client";

export type AdminSection =
  | "dashboard"
  | "news"
  | "initiatives"
  | "documents"
  | "gallery"
  | "achievements"
  | "ministries"
  | "members"
  | "pages"
  | "settings"
  | "users"
  | "observability";

export type AdminNavItem = {
  href: string;
  label: string;
  section: AdminSection;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin", label: "Дашборд", section: "dashboard" },
  { href: "/admin/news", label: "Новости", section: "news" },
  { href: "/admin/initiatives", label: "Инициативы", section: "initiatives" },
  { href: "/admin/documents", label: "Документы", section: "documents" },
  { href: "/admin/gallery", label: "Галерея", section: "gallery" },
  { href: "/admin/achievements", label: "Достижения", section: "achievements" },
  { href: "/admin/ministries", label: "Министерства", section: "ministries" },
  { href: "/admin/members", label: "Состав", section: "members" },
  { href: "/admin/pages", label: "Страницы", section: "pages" },
  { href: "/admin/settings", label: "Настройки", section: "settings" },
  { href: "/admin/users", label: "Пользователи", section: "users" },
  { href: "/admin/observability", label: "Наблюдаемость", section: "observability" },
];

const roleAccessMap: Record<AdminRole, Record<AdminSection, boolean>> = {
  CHIEF_ADMIN: {
    dashboard: true,
    news: true,
    initiatives: true,
    documents: true,
    gallery: true,
    achievements: true,
    ministries: true,
    members: true,
    pages: true,
    settings: true,
    users: true,
    observability: true,
  },
  ADMIN: {
    dashboard: true,
    news: true,
    initiatives: true,
    documents: true,
    gallery: true,
    achievements: true,
    ministries: true,
    members: true,
    pages: true,
    settings: true,
    users: false,
    observability: false,
  },
  MINISTRY_EDITOR: {
    dashboard: true,
    news: true,
    initiatives: true,
    documents: true,
    gallery: true,
    achievements: true,
    ministries: true,
    members: false,
    pages: false,
    settings: false,
    users: false,
    observability: false,
  },
  EDITOR: {
    dashboard: true,
    news: true,
    initiatives: true,
    documents: true,
    gallery: true,
    achievements: true,
    ministries: true,
    members: false,
    pages: false,
    settings: false,
    users: false,
    observability: false,
  },
  ANALYST: {
    dashboard: true,
    news: false,
    initiatives: false,
    documents: false,
    gallery: false,
    achievements: false,
    ministries: false,
    members: false,
    pages: false,
    settings: false,
    users: false,
    observability: false,
  },
};

export function canAccessSection(role: AdminRole, section: AdminSection): boolean {
  return roleAccessMap[role][section];
}

export function getAllowedRolesForSection(section: AdminSection): AdminRole[] {
  return (Object.entries(roleAccessMap) as Array<[AdminRole, Record<AdminSection, boolean>]>)
    .filter(([, access]) => access[section])
    .map(([role]) => role);
}

export function getVisibleNavItems(role: AdminRole): AdminNavItem[] {
  return ADMIN_NAV_ITEMS.filter((item) => canAccessSection(role, item.section));
}

