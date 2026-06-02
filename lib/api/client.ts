import type { AxiosError } from "axios";
import axios from "axios";
import type { ApiError } from "./types";
import { getToken } from "./token-client";
import { APP_MESSAGES } from "@/lib/app-messages";

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

/** Handle 401 by clearing token and redirecting to login. */
function handle403() {
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

client.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 403) {
      handle403();
    }
    return Promise.reject(normalizeError(error));
  },
);
