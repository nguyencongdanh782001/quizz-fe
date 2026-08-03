import type { UserRole } from "@/types/user.types";

export const VERIFY_EMAIL_PATH = "/verify-email";
export const EMAIL_VERIFICATION_REASON_HOME = "home";

const VERIFIED_EMAIL_REQUIRED_PATHS = new Set(["/", "/teacher", "/student"]);

export function normalizeAuthPath(pathname: string): string {
  if (pathname === "/") {
    return pathname;
  }

  return pathname.replace(/\/+$/, "");
}

export function requiresVerifiedEmail(pathname: string): boolean {
  return VERIFIED_EMAIL_REQUIRED_PATHS.has(normalizeAuthPath(pathname));
}

export function getVerifyEmailPath({
  email,
  nextPath,
  reason,
}: {
  email?: string | null;
  nextPath?: string | null;
  reason?: string | null;
} = {}): string {
  const params = new URLSearchParams();

  if (email) {
    params.set("email", email);
  }

  if (nextPath) {
    params.set("next", nextPath);
  }

  if (reason) {
    params.set("reason", reason);
  }

  const query = params.toString();

  return query ? `${VERIFY_EMAIL_PATH}?${query}` : VERIFY_EMAIL_PATH;
}

export function getEmailVerificationSkipPath(
  nextPath: string,
  roleName?: UserRole | null,
): string {
  if (!requiresVerifiedEmail(nextPath)) {
    return nextPath;
  }

  if (roleName === "teacher") {
    return "/teacher/profile";
  }

  if (roleName === "student") {
    return "/student/profile";
  }

  return "/login";
}
