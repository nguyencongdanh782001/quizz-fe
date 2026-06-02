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
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  },
  timeout: 10_000,
});

/** Normalize error shape so callers get a consistent ApiError. */
function normalizeError(error: unknown): ApiError {
  if (axios.isAxiosError(error) && error.response) {
    const data = error.response.data;
    const detail =
      getStringField(data, "detail") ?? getStringField(data, "message");

    return {
      detail,
      message: APP_MESSAGES.NETWORK_ERROR,
      code: getStringField(data, "code"),
      status: error.response.status,
    };
  }

  if (error instanceof Error) {
    return {
      detail: error.message,
      message: APP_MESSAGES.NETWORK_ERROR,
      status: 500,
    };
  }

  return { message: APP_MESSAGES.NETWORK_ERROR, status: 500 };
}

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

client.interceptors.response.use(
  (res) => res,
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
