import { useMutation } from "@tanstack/react-query";

import type { NicknameValidation } from "@/types/on-board";

import { validateNicknameApi } from "@/api/on-board/profile";

interface ValidateNicknameRequest {
  nickname: string;
}

export function useValidateNickname() {
  return useMutation({
    mutationFn: async (req: ValidateNicknameRequest): Promise<NicknameValidation> => {
      return validateNicknameApi(req);
    },
  });
}
