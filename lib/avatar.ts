export function getInitials(fullName?: string | null): string {
  if (!fullName) {
    return "?";
  }

  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  const firstInitial = Array.from(parts[0])[0] ?? "?";

  if (parts.length === 1) {
    return firstInitial.toLocaleUpperCase("vi-VN");
  }

  const lastInitial = Array.from(parts[parts.length - 1])[0] ?? "";

  return `${firstInitial}${lastInitial}`.toLocaleUpperCase("vi-VN");
}
