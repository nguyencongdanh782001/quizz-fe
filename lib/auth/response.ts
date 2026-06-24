import type { ProfileResponse, UserSchema } from "@/lib/api/types";
import type { User } from "@/types/user.types";
import { mapUserSchemaToUser } from "./user-mapper";

export function extractUserFromProfileResponse(
  response: ProfileResponse,
): User {
  const user: UserSchema = "user" in response ? response.user : response;

  return mapUserSchemaToUser(user);
}
