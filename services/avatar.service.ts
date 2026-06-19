import type { UploadAvatarResponse } from "@/lib/api/types";
import { api } from "@/lib/api/endpoints/auth";

export async function updateAvatar(
  file: File,
): Promise<UploadAvatarResponse> {
  const response = await api.auth.updateAvatar(file);

  return response.data;
}

export const uploadAvatar = updateAvatar;
