import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { DEFAULT_SITE_FULL_NAME, DEFAULT_SITE_SHORT_NAME, SITE_SETTING_KEYS } from "@/lib/constants";
import { resolveTelegramUrl } from "@/lib/utils/telegram";
import { getSiteSettingsMap } from "@/features/settings/service";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettingsMap().catch(() => ({} as Record<string, string>));
  const siteNameFull = settings[SITE_SETTING_KEYS.siteName] ?? DEFAULT_SITE_FULL_NAME;
  const siteNameShort = settings[SITE_SETTING_KEYS.siteNameShort] ?? DEFAULT_SITE_SHORT_NAME;
  const telegramUrl = resolveTelegramUrl(settings);

  return (
    <>
      <SiteHeader siteNameFull={siteNameFull} siteNameShort={siteNameShort} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-6">{children}</main>
      <SiteFooter
        siteNameFull={siteNameFull}
        siteNameShort={siteNameShort}
        contactAddress={settings[SITE_SETTING_KEYS.contactAddress]}
        officialTelegram={telegramUrl}
        privacyNotice={settings[SITE_SETTING_KEYS.privacyNotice]}
      />
    </>
  );
}
