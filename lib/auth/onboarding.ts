import type { UserRole } from "@/types/user.types";

export const SELECT_ROLE_PATH = "/select-role";

type OnboardingState = {
  needs_onboarding?: boolean | null;
  role_id?: number | null;
  role_name?: UserRole | null;
};

export function isOnboardingIncomplete(user: OnboardingState): boolean {
  return (
    user.needs_onboarding === true ||
    user.role_id == null ||
    user.role_name == null
  );
}

export function getRoleDashboardPath(
  roleName: UserRole | null | undefined,
): string {
  return roleName === "teacher" ? "/teacher" : "/student";
}

export function getPostAuthDestination(user: OnboardingState): string {
  if (isOnboardingIncomplete(user)) {
    return SELECT_ROLE_PATH;
  }

  return getRoleDashboardPath(user.role_name);
}
