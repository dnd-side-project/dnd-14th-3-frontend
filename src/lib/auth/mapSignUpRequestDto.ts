import type { ProfileSetupData } from "@/types/profile";

import type { SignupRequest } from "@/api/auth/sign-up.api";

const AGE_RANGE_TO_GROUP: Record<ProfileSetupData["ageRange"], SignupRequest["ageGroup"]> = {
  "10s": "TEENS",
  "20s": "TWENTIES",
  "30s": "THIRTIES",
  "40s": "FORTIES",
  "50s": "FIFTIES",
  "60s": "SIXTIES",
  "over-70s": "SEVENTIES_AND_ABOVE",
};

export function mapSignUpRequestDto(data: ProfileSetupData): SignupRequest {
  return {
    nickname: data.newUsername,
    gender: data.gender,
    ageGroup: AGE_RANGE_TO_GROUP[data.ageRange],
    introduction: data.introduction?.trim() ?? "",
    profileImageUrl: "",
    photoStyles: [...data.preferredStyles],
  };
}
