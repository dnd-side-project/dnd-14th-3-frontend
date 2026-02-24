import type { ProfileSetupData } from "@/types/on-board";

import type { SignupRequest } from "@/api/auth/sign-up.api";

export function mapSignUpRequestDto(data: ProfileSetupData): SignupRequest {
  return {
    nickname: data.newUsername,
    gender: data.gender,
    profileImageUrl: "",
    photoStyles: [...data.preferredStyles],
  };
}
