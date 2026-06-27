import type { UserSchema } from "@/lib/api/types";
import type { User } from "@/types/user.types";

export function mapUserSchemaToUser(user: UserSchema): User {
  return {
    id: user.id,
    role_id: user.role_id ?? null,
    full_name: user.full_name,
    username: user.username,
    email: user.email,
    email_verified: user.email_verified,
    auth_type: user.auth_type,
    role_name: user.role_name ?? null,
    needs_onboarding: user.needs_onboarding,
    avatar_url: user.avatar_url ?? null,
    updated_at: user.updated_at,
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
