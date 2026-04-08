"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { updateHomeBlock, upsertSiteSetting } from "@/features/settings/service";
import { OFFICIAL_TELEGRAM_URL, SITE_SETTING_KEYS } from "@/lib/constants";
import { requireAdminSession } from "@/lib/auth/session";
import { siteSettingSchema } from "@/lib/validators/pages";
import { getFormStringValue, redirectWithError, redirectWithSuccess } from "@/lib/utils/admin-action";

const editableKeys = [
  SITE_SETTING_KEYS.siteName,
  SITE_SETTING_KEYS.siteNameShort,
  SITE_SETTING_KEYS.homeIntroTitle,
  SITE_SETTING_KEYS.homeIntroText,
  SITE_SETTING_KEYS.telegramIdeaUrl,
  SITE_SETTING_KEYS.officialTelegram,
  SITE_SETTING_KEYS.privacyNotice,
] as const;

function parseHomeBlockPayload(formData: FormData, key: string) {
  const title = getFormStringValue(formData, `homeBlock:${key}:title`);
  const description = getFormStringValue(formData, `homeBlock:${key}:description`);
  const ctaLabel = getFormStringValue(formData, `homeBlock:${key}:ctaLabel`) || null;
  const ctaHref = getFormStringValue(formData, `homeBlock:${key}:ctaHref`) || null;
  const displayOrderRaw = getFormStringValue(formData, `homeBlock:${key}:displayOrder`);
  const displayOrder = Number(displayOrderRaw);
  const isEnabled = getFormStringValue(formData, `homeBlock:${key}:isEnabled`) === "on";

  if (!title || !description) {
    return null;
  }

  return {
    key,
    title,
    description,
    ctaLabel,
    ctaHref,
    displayOrder: Number.isFinite(displayOrder) ? displayOrder : 0,
    isEnabled,
  };
}

export async function updateSettingsAction(formData: FormData) {
  await requireAdminSession(["CHIEF_ADMIN", "ADMIN"]);

  for (const key of editableKeys) {
    const value =
      key === SITE_SETTING_KEYS.telegramIdeaUrl || key === SITE_SETTING_KEYS.officialTelegram
        ? OFFICIAL_TELEGRAM_URL
        : getFormStringValue(formData, key);
    const parsed = siteSettingSchema.safeParse({ key, value });

    if (!parsed.success) {
      redirectWithError("/admin/settings", parsed.error.issues[0]?.message ?? "Ошибка валидации");
    }

    await upsertSiteSetting(parsed.data.key, parsed.data.value);
  }

  const homeBlockKeys = formData
    .getAll("homeBlockKey")
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter((value): value is string => value.length > 0);

  for (const key of homeBlockKeys) {
    const block = parseHomeBlockPayload(formData, key);
    if (!block) {
      redirectWithError("/admin/settings", "Заполните все обязательные поля блоков главной страницы");
    }

    await updateHomeBlock(block.key, {
      title: block.title,
      description: block.description,
      ctaLabel: block.ctaLabel,
      ctaHref: block.ctaHref,
      displayOrder: block.displayOrder,
      isEnabled: block.isEnabled,
    });
  }

  revalidateTag("site-settings", "max");
  revalidateTag("home-blocks", "max");

  revalidatePath("/");
  revalidatePath("/suggest-idea");
  revalidatePath("/initiatives");
  revalidatePath("/contact");
  revalidatePath("/join");
  revalidatePath("/admin/settings");

  redirectWithSuccess("/admin/settings", "Настройки сохранены");
}

