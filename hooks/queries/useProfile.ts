"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ChangePasswordRequest,
  UpdateProfileRequest,
} from "@/lib/api/types";
import {
  changePassword,
  getProfile,
  updateProfile,
} from "@/services/profile.service";

export const profileQueryKeys = {
  all: ["profile"] as const,
};

export function useProfile() {
  return useQuery({
    queryKey: profileQueryKeys.all,
    queryFn: getProfile,
    staleTime: 60_000,
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateProfileRequest) => updateProfile(payload),
    onSuccess: async (result) => {
      if (result.user) {
        queryClient.setQueryData(profileQueryKeys.all, result.user);
      }

      await queryClient.invalidateQueries({
        queryKey: profileQueryKeys.all,
      });
    },
  });
}

export function useChangePasswordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ChangePasswordRequest) =>
      changePassword(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: profileQueryKeys.all,
      });
    },
  });
}
