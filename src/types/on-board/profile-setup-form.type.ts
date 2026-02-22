import type { ProfileSetupData } from "./profile-setup.type";

/** 폼 값 타입 = 제출 스키마와 동일 (undefined 미허용) */
export type ProfileSetupFormValues = ProfileSetupData;

/** 초기값만 빈 값 허용 - 스키마 검증과 무관 */
export const PROFILE_SETUP_FORM_DEFAULTS: Partial<ProfileSetupFormValues> = {
  newUsername: "",
  gender: undefined,
  ageRange: undefined,
  preferredStyles: [],
  introduction: "",
};
