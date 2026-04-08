import { z } from "zod";

import { dateInputSchema } from "@/lib/validators/common";

export const documentSchema = z.object({
  title: z.string().trim().min(1, "Укажите название"),
  description: z.string().trim().min(1, "Добавьте описание"),
  category: z.string().trim().min(1, "Укажите категорию"),
  publishedAt: dateInputSchema,
});

export type DocumentInput = z.infer<typeof documentSchema>;
