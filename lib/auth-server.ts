import { headers } from "next/headers";
import { UserSchema } from "@/lib/api/types";
import { User } from "@/types/user.types";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL!;

type MeResponse = {
  user: UserSchema;
};

function mapServerUser(user: UserSchema): User {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
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

export async function getServerSession(): Promise<User | null> {
  const cookieHeader = (await headers()).get("cookie");
  if (!cookieHeader) return null;

  const res = await fetch(`${API_URL}/auth/me`, {
    headers: {
      cookie: cookieHeader,
    },
    cache: "no-store",
  });

  if (!res.ok) return null;

  const data = (await res.json()) as MeResponse;
  return data.user ? mapServerUser(data.user) : null;
}
