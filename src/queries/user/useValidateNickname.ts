import { useMutation } from "@tanstack/react-query";

import type { NicknameValidation } from "@/types/profile";

import { validateNicknameApi } from "@/api/profile";

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
