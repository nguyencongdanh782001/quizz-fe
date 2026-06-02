import { api } from "@/lib/api/endpoints/auth";
import { APP_MESSAGES } from "@/lib/app-messages";
import type {
  ChangePasswordRequest,
  ProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  UserSchema,
} from "@/lib/api/types";

interface UpdateProfileResult {
  message: string;
  user: UserSchema | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isUserSchema(value: unknown): value is UserSchema {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "number" &&
    typeof value.full_name === "string" &&
    typeof value.username === "string" &&
    typeof value.email === "string"
  );
}

function getProfileUser(response: ProfileResponse): UserSchema {
  if ("user" in response) {
    return response.user;
  }

  return response;
}

function getUpdatedUser(response: UpdateProfileResponse): UserSchema | null {
  if (isUserSchema(response)) {
    return response;
  }

  if ("user" in response && isUserSchema(response.user)) {
    return response.user;
  }

  return null;
}

export async function getProfile(): Promise<UserSchema> {
  const response = await api.auth.profile();

  return getProfileUser(response.data);
}

export async function updateProfile(
  payload: UpdateProfileRequest,
): Promise<UpdateProfileResult> {
  const response = await api.auth.updateProfile(payload);

  return {
    message: APP_MESSAGES.UPDATE_PROFILE_SUCCESS,
    user: getUpdatedUser(response.data),
  };
}

export async function changePassword(
  payload: ChangePasswordRequest,
): Promise<string> {
  await api.auth.changePassword(payload);

  return APP_MESSAGES.CHANGE_PASSWORD_SUCCESS;
}
