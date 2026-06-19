"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { mapUserSchemaToUser } from "@/lib/auth/user-mapper";
import { profileQueryKeys } from "@/hooks/queries/useProfile";
import { updateAvatar } from "@/services/avatar.service";

export function useUpdateAvatar() {
  const queryClient = useQueryClient();
  const hydrateFromUser = useAuthStore((state) => state.hydrateFromUser);

  return useMutation({
    mutationFn: async (file: File) => updateAvatar(file),
    onSuccess: async (response) => {
      const user = mapUserSchemaToUser(response.user);

      hydrateFromUser(user);
      queryClient.setQueryData(profileQueryKeys.all, response.user);

      await queryClient.invalidateQueries({
        queryKey: profileQueryKeys.all,
      });
    },
  });
}

export const useUploadAvatar = useUpdateAvatar;
