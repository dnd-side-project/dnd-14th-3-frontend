export type ProfileEditSubject =
  | "nickname"
  | "gender"
  | "ageGroup"
  | "photoStyle"
  | "introduction";

export const PROFILE_EDIT_SUBJECT_TO_FIELD: Record<
  ProfileEditSubject,
  "nickname" | "gender" | "ageGroup" | "photoStyles" | "introduction"
> = {
  nickname: "nickname",
  gender: "gender",
  ageGroup: "ageGroup",
  photoStyle: "photoStyles",
  introduction: "introduction",
};

export const PROFILE_EDIT_SUBJECT_LABELS: Record<ProfileEditSubject, string> = {
  nickname: "닉네임",
  gender: "성별",
  ageGroup: "연령대",
  photoStyle: "촬영 스타일",
  introduction: "자기소개",
};

export const GENDER_LABELS: Record<string, string> = {
  MALE: "남성",
  FEMALE: "여성",
};

export const AGE_GROUP_LABELS: Record<string, string> = {
  TEENS: "10대",
  TWENTIES: "20대",
  THIRTIES: "30대",
  FORTIES: "40대",
  FIFTIES_AND_ABOVE: "50대 이상",
};

export function getGenderLabel(gender: string): string {
  return GENDER_LABELS[gender] ?? gender;
}

export function getAgeGroupLabel(ageGroup: string): string {
  return AGE_GROUP_LABELS[ageGroup] ?? ageGroup;
}
