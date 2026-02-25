/** 사용자 프로필 응답 */
export interface UserProfileResponse {
  nickname: string;
  profileImageUrl?: string;
  email?: string;
  phoneNumber?: string;
}

/** 사용자 프로필 수정 요청 */
export interface PatchUserProfileRequest {
  newUsername: string;
  gender: string;
  preferredStyles: string[];
}
