"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";

import type {
  InitiativeFormFieldErrors,
  InitiativeFormState,
  InitiativeFormValues,
} from "@/components/public/initiative-form-state";
import { submitPublicInitiative } from "@/features/initiatives/service";
import { logAppEvent, trackTelemetryEvent } from "@/features/observability/service";
import {
  DEFAULT_MAX_DOCUMENT_SIZE,
  DOCUMENT_ALLOWED_MIME_TYPES,
  IMAGE_ALLOWED_MIME_TYPES,
} from "@/lib/constants";
import { storage } from "@/lib/storage";
import { getFormStringValue, getOptionalFile } from "@/lib/utils/admin-action";
import { resolveUserFacingErrorMessage } from "@/lib/utils/error-message";
import { getRequestMeta } from "@/lib/utils/request-meta";
import { publicInitiativeSubmitSchema } from "@/lib/validators/initiatives";

function getFormBooleanValue(formData: FormData, key: string): boolean {
  const value = formData.get(key);
  return value === "true" || value === "on" || value === "1";
}

function getValues(formData: FormData): InitiativeFormValues {
  return {
    title: getFormStringValue(formData, "title"),
    description: getFormStringValue(formData, "description"),
    submitterClass: getFormStringValue(formData, "submitterClass"),
    submitterName: getFormStringValue(formData, "submitterName"),
    submitterContact: getFormStringValue(formData, "submitterContact"),
    personalDataConsent: getFormBooleanValue(formData, "personalDataConsent"),
  };
}

function mapFieldErrors(error: ZodError<unknown>) {
  const fieldErrors: InitiativeFormFieldErrors = {};

  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "");
    if (field === "title" || field === "description" || field === "submitterClass" || field === "personalDataConsent") {
      fieldErrors[field] = issue.message;
    }
  }

  return fieldErrors;
}

async function safeObserve(fn: () => Promise<void>) {
  try {
    await fn();
  } catch {
    // observability should never break user-facing flow
  }
}

function isInfrastructureError(error: unknown): boolean {
  if (
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientRustPanicError ||
    error instanceof Prisma.PrismaClientUnknownRequestError
  ) {
    return true;
  }

  if (!(error instanceof Error)) {
    return false;
  }

  const normalized = error.message.toLowerCase();
  return (
    normalized.includes("p1001") ||
    normalized.includes("can't reach database server") ||
    normalized.includes("econnrefused") ||
    normalized.includes("connect")
  );
}

export async function submitInitiativeAction(
  _prevState: InitiativeFormState,
  formData: FormData,
): Promise<InitiativeFormState> {
  const requestMeta = await getRequestMeta();
  const values = getValues(formData);

  const parsed = publicInitiativeSubmitSchema.safeParse(values);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Пожалуйста, заполните обязательные поля формы.",
      fieldErrors: mapFieldErrors(parsed.error),
      values,
    };
  }

  let attachmentPath: string | null = null;
  let attachmentMimeType: string | null = null;
  let attachmentSize: number | null = null;

  const attachment = getOptionalFile(formData, "attachment");
  if (attachment) {
    try {
      const saved = await storage.saveFile(attachment, {
        folder: "uploads/initiatives",
        allowedMimeTypes: [...DOCUMENT_ALLOWED_MIME_TYPES, ...IMAGE_ALLOWED_MIME_TYPES],
        maxFileSize: DEFAULT_MAX_DOCUMENT_SIZE,
      });
      attachmentPath = saved.filePath;
      attachmentMimeType = saved.mimeType;
      attachmentSize = saved.fileSize;
    } catch (error) {
      return {
        status: "error",
        message: resolveUserFacingErrorMessage(error, "Не удалось загрузить вложение"),
        values,
      };
    }
  }

  try {
    await submitPublicInitiative({
      title: parsed.data.title,
      description: parsed.data.description,
      submitterClass: parsed.data.submitterClass,
      submitterName: parsed.data.submitterName || undefined,
      submitterContact: parsed.data.submitterContact || undefined,
      attachmentPath,
      attachmentMimeType,
      attachmentSize,
    });

    await safeObserve(async () => {
      await Promise.all([
        logAppEvent({
          group: "DOMAIN",
          severity: "INFO",
          module: "initiatives",
          message: "New public initiative submitted",
          path: "/initiatives",
          method: "POST",
          ...requestMeta,
        }),
        trackTelemetryEvent({
          category: "engagement",
          eventType: "initiative_submitted",
          path: "/initiatives",
          ...requestMeta,
        }),
      ]);
    });

    revalidatePath("/initiatives");

    return {
      status: "success",
      message: "Инициатива отправлена. Спасибо за участие.",
      values: {
        title: "",
        description: "",
        submitterClass: "",
        submitterName: "",
        submitterContact: "",
        personalDataConsent: false,
      },
    };
  } catch (error) {
    await safeObserve(() =>
      logAppEvent({
        group: "DOMAIN",
        severity: "ERROR",
        module: "initiatives",
        message: "Public initiative submission failed",
        path: "/initiatives",
        method: "POST",
        metadata: {
          errorType: error instanceof Error ? error.name : "UnknownError",
          errorMessage: error instanceof Error ? error.message : String(error),
        },
        ...requestMeta,
      }),
    );

    return {
      status: "error",
      message: isInfrastructureError(error)
        ? "Сервис временно недоступен. Пожалуйста, повторите попытку позже."
        : "Не удалось отправить инициативу. Повторите попытку позже.",
      values,
    };
  }
}
