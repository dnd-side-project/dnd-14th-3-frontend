import { isAxiosError } from "axios";

import { SIGNUP_TOKEN_ERROR_CODES } from "@/constants/auth";

/** 회원가입 API 401 또는 토큰 만료/유효하지 않음 응답인지 판별 */
export function isSignupTokenError(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  const code = error.response?.data?.code;
  return (
    typeof code === "string" &&
    SIGNUP_TOKEN_ERROR_CODES.includes(code as (typeof SIGNUP_TOKEN_ERROR_CODES)[number])
  );
}
