import type { QueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { clearAllCookies } from "./clear-all-cookies";
import { emitAuthEvent } from "./auth-events";

/** Cooldown window to prevent duplicate logout executions from concurrent 401/403 responses. */
let lastLogoutAt = 0;
const LOGOUT_COOLDOWN_MS = 5_000;

/** Module-level ref to QueryClient — registered once in AppProviders. */
let queryClientRef: QueryClient | null = null;

/** Public API paths that should NOT trigger logout on 401/403. */
const PUBLIC_PATHS = ["/login", "/register", "/auth/login", "/auth/register"];

/** Keys in localStorage that are auth-related and must be cleared. */
const AUTH_STORAGE_KEYS = ["auth-storage", "auth-session"];

/** Register the QueryClient instance for cache clearing during logout. */
export function registerQueryClient(qc: QueryClient): void {
  queryClientRef = qc;
}

/**
 * Perform a full session teardown:
 * - Reset Zustand auth state
 * - Clear auth-related localStorage and all sessionStorage
 * - Clear all cookies
 * - Clear React Query cache
 * - Emit toast event
 * - Redirect to landing page (if not already there)
 *
 * Deduplicated: multiple concurrent calls within 5s only execute once.
 * Skips public API endpoints (e.g. /login returning 401 for wrong credentials).
 */
export function logoutAndClearSession(requestUrl?: string): void {
  // Skip public auth endpoints — a failed login should not log the user out.
  if (requestUrl) {
    const urlPath = new URL(requestUrl, window.location.origin).pathname;
    if (
      PUBLIC_PATHS.some(
        (p) => urlPath === p || urlPath.startsWith(p + "/"),
      )
    ) {
      return;
    }
  }

  // Deduplicate concurrent invocations with a cooldown.
  if (
    Date.now() - lastLogoutAt < LOGOUT_COOLDOWN_MS ||
    typeof window === "undefined"
  ) {
    return;
  }

  lastLogoutAt = Date.now();

  // 1. Reset Zustand auth state directly (no backend call).
  useAuthStore.setState({
    user: null,
    role_name: null,
    needs_onboarding: false,
    isAuthenticated: false,
    isLoading: false,
    fetchError: null,
  });

  // 2. Clear auth-related localStorage keys (preserve non-auth data like exam progress).
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));

  // 3. Clear all sessionStorage (used for flash toasts and ephemeral data).
  sessionStorage.clear();

  // 4. Clear all cookies.
  clearAllCookies();

  // 5. Clear React Query cache.
  queryClientRef?.clear();

  // 6. Emit event for toast notification.
  emitAuthEvent("SESSION_EXPIRED");

  // 7. Redirect to landing page (skip if already there to avoid reload loop).
  if (window.location.pathname !== "/") {
    window.location.href = "/";
  }
}
