/** 사용자 프로필 응답 (GET /api/v1/users/{userId}/profiles) */
export interface UserProfileConsent {
  notificationAllowed: boolean;
  locationAllowed: boolean;
  updatedAt: string;
}

export interface UserProfileResponse {
  userId: number;
  nickname: string;
  gender: string;
  ageGroup: string;
  introduction?: string;
  profileImageUrl?: string;
  photoStyles: string[];
  consent: UserProfileConsent;
}

/** 사용자 프로필 수정 요청 */
export interface PatchUserProfileRequest {
  nickname: string;
  gender: string;
  ageGroup: string;
  introduction: string;
  profileImageUrl?: string;
  photoStyles: string[];
}
