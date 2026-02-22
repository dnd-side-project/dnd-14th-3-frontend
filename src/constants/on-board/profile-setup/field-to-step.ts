import type { ProfileSetupStep } from "@/types/on-board";
import type { ProfileSetupFormValues } from "@/types/on-board/profile-setup-form.type";

/** 검증 실패 시 첫 에러 필드 → 이동할 스텝 */
export const FIELD_TO_STEP: Record<
  keyof ProfileSetupFormValues,
  ProfileSetupStep
> = {
  newUsername: "nickname",
  gender: "gender",
  preferredStyles: "shooting-style",
  ageRange: "age-range",
  introduction: "introduction",
};
