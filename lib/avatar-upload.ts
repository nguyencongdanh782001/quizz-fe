export const ALLOWED_AVATAR_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_AVATAR_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export function isAllowedAvatarImageType(file: File): boolean {
  return ALLOWED_AVATAR_IMAGE_TYPES.some((type) => type === file.type);
}

export function validateAvatarImageFile(file: File): string | null {
  if (!isAllowedAvatarImageType(file)) {
    return "Định dạng ảnh không được hỗ trợ. Chỉ chấp nhận JPG, PNG hoặc WEBP.";
  }

  if (file.size > MAX_AVATAR_IMAGE_SIZE_BYTES) {
    return "Kích thước ảnh không được vượt quá 5MB.";
  }

  return null;
}
