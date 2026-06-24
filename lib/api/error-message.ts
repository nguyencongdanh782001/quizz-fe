import { APP_MESSAGES } from "@/lib/app-messages";
import type { ApiError } from "@/lib/api/types";

export const DEFAULT_API_ERROR_MESSAGE = APP_MESSAGES.NETWORK_ERROR;

export function getApiErrorMessage(
  error: unknown,
  fallback: string = DEFAULT_API_ERROR_MESSAGE,
): string {
  if (isApiError(error)) {
    return error.detail || error.message || fallback;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

function isApiError(error: unknown): error is ApiError {
  return typeof error === "object" && error !== null && "status" in error;
}
