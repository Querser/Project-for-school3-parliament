import Link from "next/link";

import { AccessibilityControls } from "@/components/public/accessibility-controls";
import { EmblemLoginTrigger } from "@/components/public/emblem-login-trigger";

const links = [
  { href: "/about", label: "О парламенте" },
  { href: "/members", label: "Состав" },
  { href: "/ministries", label: "Министерства" },
  { href: "/news", label: "Новости" },
  { href: "/documents", label: "Документы" },
  { href: "/initiatives", label: "Инициативы" },
  { href: "/gallery", label: "Галерея" },
  { href: "/achievements", label: "Достижения" },
  { href: "/join", label: "Вступить" },
  { href: "/contact", label: "Контакты" },
  { href: "/search", label: "Поиск" },
];

export function SiteHeader({
  siteNameFull,
  siteNameShort,
}: {
  siteNameFull: string;
  siteNameShort: string;
}) {
  return (
    <header className="site-header border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-start md:justify-between md:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex min-w-0 flex-col">
            <span className="text-lg font-semibold tracking-wide text-slate-900">{siteNameShort}</span>
            <span className="text-xs text-slate-600">{siteNameFull}</span>
          </Link>
          <EmblemLoginTrigger />
        </div>

        <div className="flex flex-col items-start gap-3 md:items-end">
          <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-700 md:justify-end">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-md px-2 py-1 hover:bg-slate-100">
                {link.label}
              </Link>
            ))}
          </nav>
          <AccessibilityControls />
        </div>
      </div>
    </header>
  );
}

