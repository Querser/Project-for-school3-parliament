import { z } from "zod";

import { dateInputSchema } from "@/lib/validators/common";

export const reportSchema = z.object({
  title: z.string().trim().min(1, "Укажите название отчета"),
  periodLabel: z.string().trim().min(1, "Укажите период"),
  content: z.string().trim().min(1, "Добавьте текст отчета"),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]),
  publishedAt: dateInputSchema.optional().or(z.literal("")),
  ministryId: z.string().trim().optional().or(z.literal("")),
});

export type ReportInput = z.infer<typeof reportSchema>;

