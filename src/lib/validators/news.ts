import { z } from "zod";

import { dateTimeInputSchema } from "@/lib/validators/common";

export const newsSchema = z.object({
  title: z.string().trim().min(1, "Укажите заголовок новости"),
  content: z.string().trim().min(1, "Добавьте текст новости"),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]),
  publishedAt: dateTimeInputSchema.optional().or(z.literal("")),
  scheduledAt: dateTimeInputSchema.optional().or(z.literal("")),
  categoryId: z.string().trim().optional().or(z.literal("")),
  ministryId: z.string().trim().optional().or(z.literal("")),
  tags: z.string().trim().optional().or(z.literal("")),
});

export type NewsInput = z.infer<typeof newsSchema>;

