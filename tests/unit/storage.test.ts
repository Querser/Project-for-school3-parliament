import { describe, expect, it } from "vitest";

import {
  DEFAULT_MAX_DOCUMENT_SIZE,
  DOCUMENT_ALLOWED_MIME_TYPES,
  IMAGE_ALLOWED_MIME_TYPES,
} from "@/lib/constants";
import { LocalStorageProvider } from "@/lib/storage/local-storage";

describe("local storage", () => {
  const provider = new LocalStorageProvider();

  it("rejects file with unsupported mime type", async () => {
    const file = new File(["content"], "test.exe", {
      type: "application/octet-stream",
    });

    await expect(
      provider.saveFile(file, {
        folder: "uploads/tests",
        allowedMimeTypes: DOCUMENT_ALLOWED_MIME_TYPES,
        maxFileSize: DEFAULT_MAX_DOCUMENT_SIZE,
      }),
    ).rejects.toThrow("Недопустимый тип файла");
  });

  it("accepts iPhone HEIC upload even when browser sends octet-stream", async () => {
    const file = new File(["iphone-image"], "photo.heic", {
      type: "application/octet-stream",
    });

    const saved = await provider.saveFile(file, {
      folder: "uploads/tests",
      allowedMimeTypes: IMAGE_ALLOWED_MIME_TYPES,
      maxFileSize: DEFAULT_MAX_DOCUMENT_SIZE,
    });

    expect(saved.mimeType).toBe("image/heic");
    await provider.deleteFile(saved.filePath);
  });

  it("rejects octet-stream with unknown extension", async () => {
    const file = new File(["content"], "unknown.bin", {
      type: "application/octet-stream",
    });

    await expect(
      provider.saveFile(file, {
        folder: "uploads/tests",
        allowedMimeTypes: IMAGE_ALLOWED_MIME_TYPES,
        maxFileSize: DEFAULT_MAX_DOCUMENT_SIZE,
      }),
    ).rejects.toThrow("Недопустимый тип файла");
  });
});
