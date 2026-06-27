import { cookies, headers } from "next/headers";
import type { UserSchema } from "@/lib/api/types";
import type { User } from "@/types/user.types";
import { mapUserSchemaToUser } from "@/lib/auth/user-mapper";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL!;
const SESSION_COOKIE = "auth-session";

type MirroredSessionPayload = {
  id: number;
  full_name?: string;
  username?: string;
  email: string;
  email_verified?: boolean;
  auth_type?: string;
  avatar_url?: string | null;
  updated_at?: string;
  role_id?: number | null;
  role?: "teacher" | "student" | null;
  role_name?: "teacher" | "student" | null;
  needs_onboarding?: boolean;
};

function mapServerUser(user: UserSchema): User {
  return mapUserSchemaToUser(user);
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
      email_verified: payload.email_verified ?? false,
      auth_type: payload.auth_type ?? "",
      avatar_url: payload.avatar_url ?? null,
      updated_at: payload.updated_at ?? "",
      role_id: payload.role_id ?? null,
      role_name: roleName,
      needs_onboarding:
        payload.needs_onboarding === true ||
        payload.role_id == null ||
        !roleName,
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

  // Try /auth/profile first for fresh onboarding-aware data
  if (cookieHeader) {
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        headers: {
          cookie: cookieHeader,
        },
        cache: "no-store",
      });

      if (res.ok) {
        const data = (await res.json()) as { user: UserSchema } | UserSchema;
        const user = "user" in data ? data.user : data;
        return user ? mapServerUser(user) : mirroredSession;
      }
    } catch {
      // Fall through to mirrored session
    }
  }

  // Fallback: use mirrored session cookie
  return mirroredSession;
}
