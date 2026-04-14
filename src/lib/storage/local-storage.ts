import fs from "node:fs/promises";
import path from "node:path";

import mime from "mime-types";
import { nanoid } from "nanoid";

import type { SaveFileOptions, SavedFile, StorageProvider } from "@/lib/storage/types";

const STORAGE_ROOT = path.resolve(process.env.STORAGE_ROOT ?? "storage");
const OCTET_STREAM_MIME = "application/octet-stream";

const EXTENSION_TO_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".heic": "image/heic",
  ".heif": "image/heif",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".txt": "text/plain",
};

function assertSafeRelativePath(relativePath: string): string {
  const normalized = path.posix.normalize(relativePath.replaceAll("\\", "/"));
  const withoutLeadingSlash = normalized.replace(/^\/+/, "");

  if (withoutLeadingSlash.startsWith("..")) {
    throw new Error("Некорректный путь к файлу");
  }

  return withoutLeadingSlash;
}

function getExtension(file: File): string {
  const extensionFromName = path.extname(file.name || "").toLowerCase();
  if (extensionFromName) {
    return extensionFromName;
  }

  const mimeExtension = mime.extension(file.type);
  return mimeExtension ? `.${mimeExtension}` : "";
}

function resolveMimeType(file: File): string {
  const explicitMimeType = file.type.trim().toLowerCase();
  if (explicitMimeType && explicitMimeType !== OCTET_STREAM_MIME) {
    return explicitMimeType;
  }

  const extension = path.extname(file.name || "").toLowerCase();
  if (extension && EXTENSION_TO_MIME[extension]) {
    return EXTENSION_TO_MIME[extension];
  }

  return explicitMimeType;
}

function buildStorageName(file: File): string {
  const extension = getExtension(file);
  return `${Date.now()}-${nanoid(10)}${extension}`;
}

export class LocalStorageProvider implements StorageProvider {
  async saveFile(file: File, options: SaveFileOptions): Promise<SavedFile> {
    if (!file.size) {
      throw new Error("Файл не выбран");
    }

    if (file.size > options.maxFileSize) {
      throw new Error("Размер файла превышает допустимый лимит");
    }

    const normalizedMimeType = resolveMimeType(file);
    if (!options.allowedMimeTypes.includes(normalizedMimeType)) {
      throw new Error("Недопустимый тип файла");
    }

    const folder = assertSafeRelativePath(options.folder);
    const fileName = buildStorageName(file);
    const relativePath = assertSafeRelativePath(path.posix.join(folder, fileName));
    const absolutePath = this.resolveAbsolutePath(relativePath);

    await fs.mkdir(path.dirname(absolutePath), { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(absolutePath, buffer);

    return {
      filePath: relativePath,
      mimeType: normalizedMimeType,
      fileSize: buffer.byteLength,
      originalFileName: file.name,
    };
  }

  async deleteFile(filePath: string): Promise<void> {
    const safePath = assertSafeRelativePath(filePath);
    const absolutePath = this.resolveAbsolutePath(safePath);

    try {
      await fs.unlink(absolutePath);
    } catch (error) {
      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError.code !== "ENOENT") {
        throw error;
      }
    }
  }

  async readFile(filePath: string): Promise<Buffer> {
    const safePath = assertSafeRelativePath(filePath);
    const absolutePath = this.resolveAbsolutePath(safePath);
    return fs.readFile(absolutePath);
  }

  resolveAbsolutePath(filePath: string): string {
    const safePath = assertSafeRelativePath(filePath);
    const absolutePath = path.resolve(STORAGE_ROOT, safePath);

    if (!absolutePath.startsWith(STORAGE_ROOT)) {
      throw new Error("Небезопасный путь к файлу");
    }

    return absolutePath;
  }
}

export function getStorageRoot() {
  return STORAGE_ROOT;
}
