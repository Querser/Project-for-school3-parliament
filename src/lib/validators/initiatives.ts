import { z } from "zod";

const optionalClassSchema = z.string().trim().max(20, "Класс не должен превышать 20 символов").optional().or(z.literal(""));

export const initiativeSchema = z.object({
  title: z.string().trim().min(6, "Укажите тему инициативы"),
  description: z.string().trim().min(30, "Опишите инициативу подробнее"),
  submitterName: z.string().trim().max(120).optional().or(z.literal("")),
  submitterContact: z.string().trim().max(160).optional().or(z.literal("")),
  submitterClass: optionalClassSchema,
  personalDataConsent: z.boolean().default(false),
  isAnonymous: z.boolean().default(false),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  status: z.enum(["NEW", "UNDER_REVIEW", "ACCEPTED", "IN_PROGRESS", "IMPLEMENTED", "REJECTED", "ARCHIVED"]),
  assignedMinistryId: z.string().trim().optional().or(z.literal("")),
  assignedAdminId: z.string().trim().optional().or(z.literal("")),
  publicShowcase: z.boolean().default(false),
});

export const publicInitiativeSubmitSchema = z.object({
  title: z.string().trim().min(1, "Введите тему инициативы"),
  description: z.string().trim().min(1, "Введите описание инициативы"),
  submitterClass: z
    .string()
    .trim()
    .min(1, "Укажите класс")
    .max(20, "Класс не должен превышать 20 символов"),
  submitterName: z.string().trim().max(120, "ФИО слишком длинное").optional().or(z.literal("")),
  submitterContact: z.string().trim().max(160, "Контакт слишком длинный").optional().or(z.literal("")),
  personalDataConsent: z.literal(true, "Подтвердите согласие на обработку персональных данных"),
});

export type InitiativeInput = z.infer<typeof initiativeSchema>;
export type PublicInitiativeSubmitInput = z.infer<typeof publicInitiativeSubmitSchema>;
