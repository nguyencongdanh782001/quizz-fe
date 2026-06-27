import { APP_MESSAGES } from "@/lib/app-messages";

export const DEFAULT_API_ERROR_MESSAGE = APP_MESSAGES.NETWORK_ERROR;

function getStringField(
  value: unknown,
  field: string,
): string | undefined {
  if (typeof value !== "object" || value === null || !(field in value)) {
    return undefined;
  }

  const fieldValue = (value as Record<string, unknown>)[field];

  return typeof fieldValue === "string" && fieldValue.trim()
    ? fieldValue
    : undefined;
}

function looksLikeEmailAlreadyUsed(message: string): boolean {
  const normalized = message
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return (
    normalized.includes("email") &&
    (normalized.includes("exist") ||
      normalized.includes("registered") ||
      normalized.includes("taken") ||
      normalized.includes("used") ||
      normalized.includes("ton tai") ||
      normalized.includes("da duoc su dung"))
  );
}

export function getApiErrorMessage(
  error: unknown,
  fallback: string = DEFAULT_API_ERROR_MESSAGE,
): string {
  const message =
    getStringField(error, "detail") ??
    getStringField(error, "message") ??
    (error instanceof Error ? error.message : undefined);

  if (!message) {
    return fallback;
  }

  if (looksLikeEmailAlreadyUsed(message)) {
    return APP_MESSAGES.EMAIL_ALREADY_USED;
  }

  return message;
}
