export const TOKEN_KEY = "auth-session";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;

  const match = document.cookie.match(
    new RegExp("(^| )" + TOKEN_KEY + "=([^;]+)"),
  );

  return match ? decodeURIComponent(match[2]) : null;
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;

  const expires = new Date();
  expires.setDate(expires.getDate() + 7);

  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`;
}

export function clearToken(): void {
  if (typeof window === "undefined") return;

  document.cookie = `${TOKEN_KEY}=; Max-Age=0; path=/`;
}
