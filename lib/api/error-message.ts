import { APP_MESSAGES } from "@/lib/app-messages";

export const DEFAULT_API_ERROR_MESSAGE = APP_MESSAGES.NETWORK_ERROR;

export function getApiErrorMessage(
  _error: unknown,
  fallback: string = DEFAULT_API_ERROR_MESSAGE,
): string {
  return fallback;
}
