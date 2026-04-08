import { z } from "zod";

export const globalSearchSchema = z.object({
  q: z.string().trim().min(2, "Введите минимум 2 символа").max(120),
  scope: z
    .enum(["all", "news", "documents", "ministries", "events", "reports", "achievements"])
    .default("all"),
});

export type GlobalSearchInput = z.infer<typeof globalSearchSchema>;

