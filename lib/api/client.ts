import type { AxiosError } from "axios";
import axios from "axios";
import type { ApiError } from "./types";
import { getToken } from "./token-client";
import { APP_MESSAGES } from "@/lib/app-messages";
import { logoutAndClearSession } from "@/lib/auth/logout-and-clear-session";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 30_000,
});

/**
 * Gắn token vào thời điểm request được gửi.
 *
 * Không đặt Content-Type mặc định để Axios tự xử lý:
 * - Object thông thường: application/json
 * - FormData: multipart/form-data kèm boundary
 */
client.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  } else {
    config.headers.delete("Authorization");
  }

  /**
   * Với FormData, phải để browser tự thêm:
   *
   * Content-Type: multipart/form-data; boundary=...
   *
   * Nếu tự đặt Content-Type, backend có thể không đọc được file.
   */
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    config.headers.delete("Content-Type");
  }

  return config;
});

function getField(value: unknown, field: string): unknown {
  if (typeof value !== "object" || value === null || !(field in value)) {
    return undefined;
  }

  return (value as Record<string, unknown>)[field];
}

function getStringField(value: unknown, field: string): string | undefined {
  if (typeof value !== "object" || value === null || !(field in value)) {
    return undefined;
  }

  const fieldValue = (value as Record<string, unknown>)[field];

  return typeof fieldValue === "string" && fieldValue.trim()
    ? fieldValue
    : undefined;
}

function getValidationDetail(value: unknown): string | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  for (const item of value) {
    const message = getStringField(item, "msg");

    if (!message) {
      continue;
    }

    const location = getField(item, "loc");
    const locationText = Array.isArray(location)
      ? location.map(String).join(".")
      : "";

    return locationText ? `${locationText}: ${message}` : message;
  }

  return undefined;
}

/** Chuẩn hóa lỗi để các component nhận cùng một cấu trúc ApiError. */
function normalizeError(error: unknown): ApiError {
  if (axios.isAxiosError(error) && error.response) {
    const data = error.response.data;
    const rawDetail = getField(data, "detail");

    const detail =
      (typeof rawDetail === "string" && rawDetail.trim()
        ? rawDetail
        : undefined) ??
      getValidationDetail(rawDetail) ??
      getStringField(data, "message");

    const details =
      typeof rawDetail === "object" &&
      rawDetail !== null &&
      !Array.isArray(rawDetail)
        ? (rawDetail as Record<string, unknown>)
        : Array.isArray(rawDetail)
          ? { validation: rawDetail }
          : undefined;

    return {
      detail,
      details,
      message: detail ?? APP_MESSAGES.NETWORK_ERROR,
      code: getStringField(data, "code"),
      status: error.response.status,
    };
  }

  if (axios.isAxiosError(error)) {
    return {
      detail:
        error.code === "ECONNABORTED"
          ? "Yêu cầu đã hết thời gian chờ."
          : error.message,
      message: APP_MESSAGES.NETWORK_ERROR,
      status: 500,
    };
  }

  if (error instanceof Error) {
    return {
      detail: error.message,
      message: APP_MESSAGES.NETWORK_ERROR,
      status: 500,
    };
  }

  return {
    message: APP_MESSAGES.NETWORK_ERROR,
    status: 500,
  };
}

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url ?? "";

    if (
      (status === 401 || status === 403) &&
      !url.includes("/login") &&
      !url.includes("/register")
    ) {
      logoutAndClearSession(url);
    }

    return Promise.reject(normalizeError(error));
  },
);
