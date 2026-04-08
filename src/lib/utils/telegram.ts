import { OFFICIAL_TELEGRAM_URL, SITE_SETTING_KEYS } from "@/lib/constants";

export function resolveTelegramUrl(settings?: Record<string, string>): string {
  if (!settings) {
    return OFFICIAL_TELEGRAM_URL;
  }

  const candidate =
    settings[SITE_SETTING_KEYS.officialTelegram] ?? settings[SITE_SETTING_KEYS.telegramIdeaUrl] ?? OFFICIAL_TELEGRAM_URL;

  if (!candidate) {
    return OFFICIAL_TELEGRAM_URL;
  }

  // По требованию продукта Telegram-контакт фиксирован на @alisa_boris.
  return OFFICIAL_TELEGRAM_URL;
}
