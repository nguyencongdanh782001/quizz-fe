/**
 * Clear all cookies for the current domain.
 * Used during emergency session teardown (401/403 responses).
 *
 * Attempts multiple attribute combinations to ensure cookies
 * set with various flags (secure, samesite) are fully removed.
 */
export function clearAllCookies(): void {
  if (typeof document === "undefined") return;

  document.cookie.split(";").forEach((cookie) => {
    const [name] = cookie.split("=");
    const trimmedName = name?.trim();
    if (!trimmedName) return;

    const expires = new Date(0).toUTCString();

    // Clear with path=/ (most common)
    document.cookie = `${trimmedName}=; expires=${expires}; path=/`;

    // Clear with secure + samesite=strict (matches token-client.ts)
    document.cookie = `${trimmedName}=; expires=${expires}; path=/; secure; samesite=strict`;

    // Clear with samesite=lax (matches auth-store.ts)
    document.cookie = `${trimmedName}=; expires=${expires}; path=/; samesite=lax`;
  });
}
