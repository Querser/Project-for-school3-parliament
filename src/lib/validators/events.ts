import { z } from "zod";

import { dateTimeInputSchema } from "@/lib/validators/common";

export const eventSchema = z
  .object({
    title: z.string().trim().min(1, "Укажите название события"),
    description: z.string().trim().min(1, "Добавьте описание события"),
    category: z.string().trim().min(1, "Укажите категорию"),
    organizer: z.string().trim().max(160).optional().or(z.literal("")),
    location: z.string().trim().max(160).optional().or(z.literal("")),
    startAt: dateTimeInputSchema,
    endAt: dateTimeInputSchema.optional().or(z.literal("")),
    status: z.enum(["PLANNED", "COMPLETED", "CANCELLED"]),
    ministryId: z.string().trim().optional().or(z.literal("")),
  })
  .refine(
    (value) => {
      if (!value.endAt) {
        return true;
      }

      return new Date(value.endAt).getTime() >= new Date(value.startAt).getTime();
    },
    {
      message: "Дата и время окончания не могут быть раньше начала",
      path: ["endAt"],
    },
  );

export type EventInput = z.infer<typeof eventSchema>;

