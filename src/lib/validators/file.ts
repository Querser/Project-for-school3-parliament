import { z } from "zod";

export const fileUploadSchema = z
  .custom<File>((value) => value instanceof File, "Файл обязателен")
  .refine((file) => file.size > 0, "Файл обязателен");
