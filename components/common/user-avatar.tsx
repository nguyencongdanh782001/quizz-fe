"use client";

import { UserRound } from "lucide-react";
import * as React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { getInitials } from "@/lib/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps extends React.ComponentProps<typeof Avatar> {
  avatarUrl?: string | null;
  fullName?: string | null;
  imageClassName?: string;
  fallbackClassName?: string;
}

export function UserAvatar({
  avatarUrl,
  fullName,
  className,
  imageClassName,
  fallbackClassName,
  ...props
}: UserAvatarProps) {
  const trimmedAvatarUrl = avatarUrl?.trim();
  const displayName = fullName?.trim();
  const initials = getInitials(displayName);
  const alt = displayName
    ? `Ảnh đại diện của ${displayName}`
    : "Ảnh đại diện người dùng";

  return (
    <Avatar className={cn("rounded-full", className)} {...props}>
      {trimmedAvatarUrl ? (
        <AvatarImage
          src={trimmedAvatarUrl}
          alt={alt}
          className={imageClassName}
        />
      ) : null}
      <AvatarFallback
        className={cn(
          "relative isolate overflow-hidden rounded-[inherit] bg-linear-to-br from-primary via-tertiary to-secondary font-display font-bold text-white shadow-inner ring-1 ring-white/35",
          fallbackClassName,
        )}
      >
        <span
          aria-hidden="true"
          className="absolute -left-2 -top-2 h-1/2 w-1/2 rounded-full bg-white/25 blur-sm"
        />
        <span
          aria-hidden="true"
          className="absolute -bottom-3 -right-2 h-2/3 w-2/3 rounded-full bg-black/10 blur-md"
        />
        {initials === "?" ? (
          <UserRound className="relative z-10 h-1/2 w-1/2" aria-hidden="true" />
        ) : (
          <span className="relative z-10">{initials}</span>
        )}
      </AvatarFallback>
    </Avatar>
  );
}
