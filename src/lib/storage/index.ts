import { LocalStorageProvider } from "@/lib/storage/local-storage";

export const storage = new LocalStorageProvider();

export function toPublicUploadUrl(filePath: string): string {
  return `/api/uploads/${filePath.replaceAll("\\", "/")}`;
}
