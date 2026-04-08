const SAFE_USER_ERROR_MESSAGES = new Set([
  "Файл не выбран",
  "Размер файла превышает допустимый лимит",
  "Недопустимый тип файла",
  "Некорректный путь к файлу",
  "Небезопасный путь к файлу",
]);

export function resolveUserFacingErrorMessage(
  error: unknown,
  fallbackMessage: string,
  additionalSafeMessages: string[] = [],
): string {
  if (!(error instanceof Error)) {
    return fallbackMessage;
  }

  const message = error.message.trim();
  if (!message) {
    return fallbackMessage;
  }

  if (SAFE_USER_ERROR_MESSAGES.has(message) || additionalSafeMessages.includes(message)) {
    return message;
  }

  return fallbackMessage;
}
