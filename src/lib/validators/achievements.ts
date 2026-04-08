import { z } from "zod";

import { dateInputSchema } from "@/lib/validators/common";

export const achievementSchema = z.object({
  title: z.string().trim().min(1, "Укажите название достижения"),
  content: z.string().trim().min(1, "Добавьте полный текст"),
  impact: z.string().trim().max(220).optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  publishedAt: dateInputSchema.optional().or(z.literal("")),
  ministryId: z.string().trim().optional().or(z.literal("")),
});

export type AchievementInput = z.infer<typeof achievementSchema>;

