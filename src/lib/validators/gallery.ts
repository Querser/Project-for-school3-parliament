import { z } from "zod";

import { dateInputSchema } from "@/lib/validators/common";

export const galleryAlbumSchema = z.object({
  title: z.string().trim().min(1, "Укажите название альбома"),
  description: z.string().trim().min(1, "Добавьте описание альбома"),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]),
  publishedAt: dateInputSchema.optional().or(z.literal("")),
});

export const galleryItemSchema = z.object({
  caption: z.string().trim().max(300).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().nonnegative().default(0),
});

export type GalleryAlbumInput = z.infer<typeof galleryAlbumSchema>;
export type GalleryItemInput = z.infer<typeof galleryItemSchema>;

