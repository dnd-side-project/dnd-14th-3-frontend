import { useMutation } from "@tanstack/react-query";

import type { ProfileSetupData } from "@/types/on-board";
import { profileSetupDataSchema } from "@/types/on-board";

import { logger } from "@/lib/shared/logger";

import { submitProfileApi } from "@/api/on-board/profile";

export function useSubmitProfile() {
  return useMutation({
    mutationFn: async (data: ProfileSetupData) => {
      // 유효성 검증 실행
      const validation = profileSetupDataSchema.safeParse({
        newUsername: data.newUsername,
        gender: data.gender,
        preferredStyles: data.preferredStyles,
        ageRange: data.ageRange,
        introduction: data.introduction,
      });

      // 유효성 검증 실패 시 에러 메시지 반환
      if (!validation.success) {
        const errorMessage = validation.error.issues.map((e) => e.message).join(", ");
        logger.error(errorMessage);
        throw new Error(errorMessage);
      }

      // 유효성 검증 통과 시 프로필 제출
      await submitProfileApi({
        ...validation.data,
      });
    },
  });
}
