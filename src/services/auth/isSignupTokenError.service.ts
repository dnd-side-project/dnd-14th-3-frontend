import { isAxiosError } from "axios";

import { SIGNUP_TOKEN_ERROR_CODES } from "@/constants/auth";

type SignupErrorResponse = {
  code?: string;
  message?: string;
};

function getSignupErrorResponse(error: unknown): SignupErrorResponse | null {
  if (!isAxiosError(error)) return null;
  const data = error.response?.data as SignupErrorResponse | undefined;
  return data ?? null;
}

/** 회원가입 API 401 또는 토큰 만료/유효하지 않음 응답인지 판별 */
export function isSignupTokenError(error: unknown): boolean {
  if (!isAxiosError(error)) return false;

  if (error.response?.status === 401) {
    return true;
  }

  const code = error.response?.data?.code;
  return (
    typeof code === "string" &&
    SIGNUP_TOKEN_ERROR_CODES.includes(code as (typeof SIGNUP_TOKEN_ERROR_CODES)[number])
  );
}

export function isSignupInvalidParameterError(error: unknown): boolean {
  if (!isAxiosError(error) || error.response?.status !== 400) {
    return false;
  }

  const data = getSignupErrorResponse(error);
  return data?.code === "INVALID_PARAMETER";
}

export function getSignupErrorMessage(error: unknown): string | null {
  const data = getSignupErrorResponse(error);
  return typeof data?.message === "string" ? data.message : null;
}
