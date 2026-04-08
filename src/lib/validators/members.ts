import { z } from "zod";

export const memberSchema = z.object({
  fullName: z.string().trim().min(5, "Укажите ФИО"),
  slug: z.string().trim().max(120, "Слишком длинный slug").optional().or(z.literal("")),
  roleType: z.enum(["PRESIDENT", "VICE_PRESIDENT", "DEPUTY", "MINISTER"]),
  positionTitle: z.string().trim().min(3, "Укажите должность"),
  shortBio: z.string().trim().min(10, "Добавьте описание обязанностей"),
  ministryIds: z.array(z.string().trim().min(1)).default([]),
  displayOrder: z.coerce.number().int().nonnegative().default(0),
});

export type MemberInput = z.infer<typeof memberSchema>;
