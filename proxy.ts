import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  EMAIL_VERIFICATION_REASON_HOME,
  VERIFY_EMAIL_PATH,
  getVerifyEmailPath,
  normalizeAuthPath,
  requiresVerifiedEmail,
} from "@/lib/auth/email-verification";
import { SELECT_ROLE_PATH, isOnboardingIncomplete } from "@/lib/auth/onboarding";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
const SESSION_COOKIE = "auth-session";
const REGISTER_PATH = "/register";

type MirroredSessionPayload = {
  id: number;
  email?: string;
  email_verified?: boolean;
  role_id?: number | null;
  role_name?: "teacher" | "student" | null;
  needs_onboarding?: boolean;
};

type ProfilePayload = {
  email?: string;
  email_verified?: boolean;
  role_id?: number | null;
  role_name?: "teacher" | "student" | null;
  needs_onboarding?: boolean;
};

function decodeMirroredSession(value: string): MirroredSessionPayload | null {
  try {
    const binary = atob(value);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as MirroredSessionPayload;
  } catch {
    return null;
  }
}

function getSession(request: NextRequest): MirroredSessionPayload | null {
  const value = request.cookies.get(SESSION_COOKIE)?.value;

  if (!value) {
    return null;
  }

  return decodeMirroredSession(value);
}

async function getProfileSession(
  request: NextRequest,
): Promise<ProfilePayload | null> {
  if (!API_URL) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/auth/profile`, {
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as unknown;
    const payload = data as { user?: ProfilePayload };

    if (payload.user) {
      return payload.user;
    }

    return data as ProfilePayload;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const pathname = normalizeAuthPath(request.nextUrl.pathname);
  const profileSession = await getProfileSession(request);
  const session = profileSession ?? getSession(request);

  if (!session) {
    return NextResponse.next();
  }

  if (
    session.email_verified === false &&
    requiresVerifiedEmail(pathname)
  ) {
    const url = request.nextUrl.clone();
    const verifyPath = getVerifyEmailPath({
      email: session.email,
      nextPath: pathname,
      reason: EMAIL_VERIFICATION_REASON_HOME,
    });
    url.pathname = VERIFY_EMAIL_PATH;
    url.search = verifyPath.includes("?") ? verifyPath.slice(VERIFY_EMAIL_PATH.length) : "";

    return NextResponse.redirect(url);
  }

  if (
    session.email_verified === true &&
    pathname === VERIFY_EMAIL_PATH &&
    isOnboardingIncomplete(session)
  ) {
    const url = request.nextUrl.clone();
    url.pathname = SELECT_ROLE_PATH;
    url.search = "";

    return NextResponse.redirect(url);
  }

  if (
    isOnboardingIncomplete(session) &&
    pathname !== SELECT_ROLE_PATH &&
    pathname !== VERIFY_EMAIL_PATH &&
    pathname !== REGISTER_PATH
  ) {
    const url = request.nextUrl.clone();
    url.pathname = SELECT_ROLE_PATH;
    url.search = "";

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
