import { cookies, headers } from "next/headers";
import { UserSchema } from "@/lib/api/types";
import { User } from "@/types/user.types";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL!;
const SESSION_COOKIE = "auth-session";

type MeResponse = {
  user: UserSchema;
};

type MirroredSessionPayload = {
  id: number;
  full_name?: string;
  username?: string;
  email: string;
  auth_type?: string;
  role?: "teacher" | "student" | null;
  role_name?: "teacher" | "student" | null;
  needs_onboarding?: boolean;
};

function mapServerUser(user: UserSchema): User {
  return {
    id: user.id,
    full_name: user.full_name,
    username: user.username,
    email: user.email,
    auth_type: user.auth_type,
    role_name: user.role_name ?? null,
    needs_onboarding: user.needs_onboarding,
    avatar_url: user.avatar_url ?? null,
    created_at: user.created_at,
    profile: user.profile
      ? {
          date_of_birth: user.profile.date_of_birth,
          age: user.profile.age,
          gender: user.profile.gender,
          school_name: user.profile.school_name ?? null,
          onboarding_completed_at: user.profile.onboarding_completed_at,
        }
      : null,
  };
}

function decodeMirroredSession(value: string): User | null {
  try {
    const payload = JSON.parse(
      Buffer.from(value, "base64").toString("utf8"),
    ) as MirroredSessionPayload;

    if (!payload?.id || !payload.email) {
      return null;
    }

    const roleName = payload.role_name ?? payload.role ?? null;

    return {
      id: payload.id,
      full_name: payload.full_name ?? "",
      username: payload.username ?? "",
      email: payload.email,
      auth_type: payload.auth_type ?? "",
      role_name: roleName,
      needs_onboarding: payload.needs_onboarding ?? !roleName,
      avatar_url: null,
      created_at: "",
      profile: null,
    };
  } catch {
    return null;
  }
}

export async function getServerSession(): Promise<User | null> {
  const cookieHeader = (await headers()).get("cookie");
  const cookieStore = await cookies();
  const mirroredSession = decodeMirroredSession(
    cookieStore.get(SESSION_COOKIE)?.value ?? "",
  );

  // Try /auth/me first for fresh data
  if (cookieHeader) {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          cookie: cookieHeader,
        },
        cache: "no-store",
      });

      if (res.ok) {
        const data = (await res.json()) as MeResponse;
        return data.user ? mapServerUser(data.user) : mirroredSession;
      }
    } catch {
      // Fall through to mirrored session
    }
  }

  // Fallback: use mirrored session cookie
  return mirroredSession;
}
