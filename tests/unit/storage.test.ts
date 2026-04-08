import { describe, expect, it } from "vitest";

import {
  DEFAULT_MAX_DOCUMENT_SIZE,
  DOCUMENT_ALLOWED_MIME_TYPES,
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
});
