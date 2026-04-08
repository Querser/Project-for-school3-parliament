import { z } from "zod";

export function ensureOptionalString(value: unknown): string | null {
  const parsed = z.string().trim().optional().parse(value);
  if (!parsed) {
    return null;
  }

  return parsed.length > 0 ? parsed : null;
}

export function parsePositiveInt(value: unknown, fallback = 0): number {
  const parsed = z.coerce.number().int().nonnegative().safeParse(value);
  return parsed.success ? parsed.data : fallback;
}

export const dateInputSchema = z
  .string()
  .trim()
  .min(1, "Укажите дату")
  .refine((value) => !Number.isNaN(new Date(value).getTime()), "Некорректная дата");

export const dateTimeInputSchema = z
  .string()
  .trim()
  .min(1, "Укажите дату и время")
  .refine((value) => !Number.isNaN(new Date(value).getTime()), "Некорректные дата и время");

