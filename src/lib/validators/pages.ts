import { z } from "zod";

export const staticPageSchema = z.object({
  key: z.string().trim().min(1),
  title: z.string().trim().min(3, "Укажите заголовок"),
  content: z.string().trim().min(10, "Добавьте содержимое"),
});

export const siteSettingSchema = z.object({
  key: z.string().trim().min(1),
  value: z.string().trim().min(1, "Значение не может быть пустым"),
});

export type StaticPageInput = z.infer<typeof staticPageSchema>;
export type SiteSettingInput = z.infer<typeof siteSettingSchema>;
