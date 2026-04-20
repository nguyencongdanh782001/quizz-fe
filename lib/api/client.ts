import type { AxiosError } from "axios";
import axios from "axios";
import type { ApiError } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

/** Normalize error shape so callers get a consistent ApiError. */
function normalizeError(error: unknown): ApiError {
  if (error instanceof axios.AxiosError && error.response?.data) {
    const data = error.response.data;
    return {
      detail: data.detail,
      message: data.message ?? data.detail ?? error.message,
      code: data.code,
      status: error.response.status,
    };
  }
  if (error instanceof Error) {
    return { message: error.message, status: 500 };
  }
  return { message: "Unknown error", status: 500 };
}

/** Handle 401 by clearing token and redirecting to login. */
function handle401() {
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

client.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      handle401();
    }
    return Promise.reject(normalizeError(error));
  },
);
