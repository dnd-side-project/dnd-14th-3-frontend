/** 사용자 권한 동의 설정 응답 */
export interface UserConsentResponse {
  notificationAllowed: boolean;
  locationAllowed: boolean;
  updatedAt?: string;
}

/** User 권한 동의 설정 수정 요청 (UserConsentUpdateRequest) */
export interface PatchUserConsentsRequest {
  notificationAllowed: boolean;
  locationAllowed: boolean;
}
