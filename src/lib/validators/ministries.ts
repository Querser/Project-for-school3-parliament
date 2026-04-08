import { z } from "zod";

export const ministrySchema = z.object({
  name: z.string().trim().min(3, "Укажите название"),
  description: z.string().trim().min(10, "Добавьте описание министерства"),
  ministerMemberId: z.string().trim().optional().or(z.literal("")),
  displayOrder: z.coerce.number().int().nonnegative().default(0),
});

export type MinistryInput = z.infer<typeof ministrySchema>;
