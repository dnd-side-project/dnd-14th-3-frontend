/** 회원가입 API 토큰 만료/유효하지 않음 시 응답 code (swagger 기준) */
export const SIGNUP_TOKEN_ERROR_CODES = ["TOKEN_EXPIRED", "INVALID_TOKEN"] as const;

export type SignupTokenErrorCode = (typeof SIGNUP_TOKEN_ERROR_CODES)[number];
