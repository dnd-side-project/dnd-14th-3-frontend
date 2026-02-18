import { useMutation } from "@tanstack/react-query";

import type { ProfileSetupData } from "@/types/on-board";
import { profileSubmitSchema } from "@/types/on-board";

import { logger } from "@/lib/shared/logger";

import { submitProfileApi } from "@/api/on-board/profile";

export function useSubmitProfile() {
  return useMutation({
    mutationFn: async (data: ProfileSetupData) => {
      const validation = profileSubmitSchema.safeParse({
        newUsername: data.newUsername,
        gender: data.gender,
        preferredStyles: data.preferredStyles,
        ageRange: data.ageRange,
        introduction: data.introduction,
      });

      if (!validation.success) {
        logger.error(validation.error.errors.map((e) => e.message).join(", "));
        throw new Error(validation.error.errors.map((e) => e.message).join(", "));
      }

      await submitProfileApi({
        newUsername: data.newUsername,
        gender: data.gender,
        preferredStyles: data.preferredStyles,
        ageRange: data.ageRange,
        introduction: data.introduction,
      });
    },
  });
}
