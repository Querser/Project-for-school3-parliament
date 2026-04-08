"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { upsertStaticPage } from "@/features/pages/service";
import { STATIC_PAGE_KEYS } from "@/lib/constants";
import { requireAdminSession } from "@/lib/auth/session";
import { staticPageSchema } from "@/lib/validators/pages";
import { getFormStringValue, redirectWithError, redirectWithSuccess } from "@/lib/utils/admin-action";

const allowedKeys = new Set<string>(Object.values(STATIC_PAGE_KEYS));

export async function updateStaticPageAction(formData: FormData) {
  await requireAdminSession(["CHIEF_ADMIN", "ADMIN"]);

  const key = getFormStringValue(formData, "key");
  if (!allowedKeys.has(key)) {
    redirectWithError("/admin/pages", "Некорректный ключ страницы");
  }

  const parsed = staticPageSchema.safeParse({
    key,
    title: getFormStringValue(formData, "title"),
    content: getFormStringValue(formData, "content"),
  });

  if (!parsed.success) {
    redirectWithError("/admin/pages", parsed.error.issues[0]?.message ?? "Ошибка валидации");
  }

  await upsertStaticPage(parsed.data.key, parsed.data.title, parsed.data.content);

  revalidateTag("static-pages", "max");

  revalidatePath("/about");
  revalidatePath("/suggest-idea");
  revalidatePath("/initiatives");
  revalidatePath("/join");
  revalidatePath("/contact");
  revalidatePath("/admin/pages");

  redirectWithSuccess("/admin/pages", "Страница обновлена");
}

