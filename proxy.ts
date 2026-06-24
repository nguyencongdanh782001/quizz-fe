import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { SELECT_ROLE_PATH, isOnboardingIncomplete } from "@/lib/auth/onboarding";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
const SESSION_COOKIE = "auth-session";

type MirroredSessionPayload = {
  id: number;
  role_id?: number | null;
  role_name?: "teacher" | "student" | null;
  needs_onboarding?: boolean;
};

type ProfilePayload = {
  role_id?: number | null;
  role_name?: "teacher" | "student" | null;
  needs_onboarding?: boolean;
};

function normalizePath(pathname: string): string {
  if (pathname === "/") {
    return pathname;
  }

  return pathname.replace(/\/+$/, "");
}

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
  const pathname = normalizePath(request.nextUrl.pathname);
  const profileSession = await getProfileSession(request);
  const session = profileSession ?? getSession(request);

  if (!session) {
    return NextResponse.next();
  }

  if (isOnboardingIncomplete(session) && pathname !== SELECT_ROLE_PATH) {
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
