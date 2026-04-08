import Link from "next/link";

export function SiteFooter({
  siteNameFull,
  siteNameShort,
  contactAddress,
  officialTelegram,
  privacyNotice,
}: {
  siteNameFull: string;
  siteNameShort: string;
  contactAddress?: string;
  officialTelegram?: string;
  privacyNotice?: string;
}) {
  const resolvedAddress = contactAddress?.trim() || "Московская область, г. Можайск, улица Полосухина, 3А";

  return (
    <footer className="site-footer mt-10 border-t border-slate-200 bg-white">
      <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-6 text-sm text-slate-600 md:grid-cols-2 md:px-6">
        <div className="space-y-1">
          <p className="font-medium text-slate-900">{siteNameShort}</p>
          <p>{siteNameFull}</p>
          <p>Официальный цифровой портал ученического самоуправления.</p>
          {privacyNotice ? <p className="pt-2 text-xs text-slate-500">{privacyNotice}</p> : null}
        </div>
        <div className="space-y-1">
          <p className="font-medium text-slate-900">Контакты</p>
          <p>Адрес: {resolvedAddress}</p>
          {officialTelegram ? (
            <p>
              Telegram:{" "}
              <Link href={officialTelegram} className="text-slate-800 hover:underline" target="_blank">
                {officialTelegram}
              </Link>
            </p>
          ) : null}
          <p>
            <Link href="/contact" className="text-slate-800 hover:underline">
              Перейти к странице контактов
            </Link>
          </p>
          <p>
            <Link href="/privacy-policy" className="text-slate-800 hover:underline">
              Политика конфиденциальности
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
