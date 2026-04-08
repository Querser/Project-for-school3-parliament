export interface SavedFile {
  filePath: string;
  mimeType: string;
  fileSize: number;
  originalFileName: string;
}

export interface SaveFileOptions {
  folder: string;
  allowedMimeTypes: readonly string[];
  maxFileSize: number;
}

export interface StorageProvider {
  saveFile(file: File, options: SaveFileOptions): Promise<SavedFile>;
  deleteFile(filePath: string): Promise<void>;
  readFile(filePath: string): Promise<Buffer>;
  resolveAbsolutePath(filePath: string): string;
}
