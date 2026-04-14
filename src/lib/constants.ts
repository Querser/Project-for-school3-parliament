export const STATIC_PAGE_KEYS = {
  about: "about",
  suggestIdea: "suggest_idea",
  join: "join",
  contact: "contact",
  privacyPolicy: "privacy_policy",
} as const;

export const SITE_SETTING_KEYS = {
  siteName: "site_name",
  siteNameShort: "site_name_short",
  homeIntroTitle: "home_intro_title",
  homeIntroText: "home_intro_text",
  telegramIdeaUrl: "telegram_idea_url",
  contactEmail: "contact_email",
  contactPhone: "contact_phone",
  contactAddress: "contact_address",
  officialTelegram: "official_telegram",
  privacyNotice: "privacy_notice",
} as const;

export const DEFAULT_SITE_FULL_NAME = "Ученический парламент МОУ СОШ в„–3 г. Можайска";
export const DEFAULT_SITE_SHORT_NAME = "Ученический парламент";
export const OFFICIAL_TELEGRAM_URL = "https://t.me/alisa_boris";

export const DOCUMENT_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
];

export const IMAGE_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/heic",
  "image/heif",
];

export const IMAGE_UPLOAD_ACCEPT =
  "image/png,image/jpeg,image/jpg,image/pjpeg,image/webp,image/svg+xml,image/heic,image/heif,.png,.jpg,.jpeg,.webp,.svg,.heic,.heif";

export const PUBLIC_ATTACHMENT_ACCEPT =
  ".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.webp,.svg,.heic,.heif";

export const DEFAULT_MAX_IMAGE_SIZE = Number(process.env.MAX_IMAGE_SIZE_MB ?? 5) * 1024 * 1024;
export const DEFAULT_MAX_DOCUMENT_SIZE = Number(process.env.MAX_DOCUMENT_SIZE_MB ?? 15) * 1024 * 1024;

