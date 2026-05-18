export const DEFAULT_API_ERROR_MESSAGE =
  "Có lỗi xảy ra, vui lòng thử lại";

export function getApiErrorMessage(
  error: unknown,
  fallback = DEFAULT_API_ERROR_MESSAGE,
): string {
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    if ("message" in error && typeof error.message === "string") {
      const message = error.message.trim();

      if (message) {
        return message;
      }
    }

    if ("detail" in error && typeof error.detail === "string") {
      const detail = error.detail.trim();

      if (detail) {
        return detail;
      }
    }
  }

  return fallback;
}
