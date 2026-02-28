import type { ProfileSetupData } from "@/types/profile";

import type { SignupRequest } from "@/api/auth/sign-up.api";

export function mapSignUpRequestDto(data: ProfileSetupData): SignupRequest {
  const profileImageUrl = localStorage.getItem("profileImageUrl");
  localStorage.removeItem("profileImageUrl");
  return {
    nickname: data.newUsername,
    gender: data.gender,
    ageGroup: data.ageRange,
    introduction: data.introduction?.trim() ?? "",
    profileImageUrl: profileImageUrl ?? undefined,
    photoStyles: [...data.preferredStyles],
  };
}
