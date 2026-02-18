import type { NicknameValidation } from "@/types/on-board";

import { apiClient } from "@/api/client";

/** 입력된 닉네임이 회원 가입에 사용 가능한지 확인합니다. */
export interface ValidateNicknameRequest {
  nickname: string;
}

/** 200: data=true 사용 가능, data=false 이미 사용 중. 400: 형식 위반 */
export interface ValidateNicknameResponse {
  success: boolean;
  message?: string;
  code?: string;
  data: boolean | null;
}

export async function validateNicknameApi(
  req: ValidateNicknameRequest
): Promise<NicknameValidation> {
  try {
    const response = await apiClient.post<ValidateNicknameResponse>(
      "/api/v1/profile/validate-nickname",
      req
    );

    const { success, message, code, data } = response.data;

    if (!success && code === "INVALID_NICKNAME_FORMAT") {
      return {
        isValid: false,
        error: message ?? "닉네임 형식이 올바르지 않습니다.",
        type: "format",
      };
    }

    if (success && data === false) {
      const type = code === "FORBIDDEN_NICKNAME" ? "forbidden" : "duplicate";
      return {
        isValid: false,
        error: message ?? (type === "forbidden" ? "사용할 수 없는 닉네임입니다" : "이미 사용 중인 닉네임입니다"),
        type,
      };
    }

    return { isValid: true };
  } catch (error: unknown) {
    const axiosError = error as { response?: { status: number; data?: ValidateNicknameResponse } };
    if (axiosError.response?.status === 400 && axiosError.response?.data?.code === "INVALID_NICKNAME_FORMAT") {
      const { message } = axiosError.response.data;
      return {
        isValid: false,
        error: message ?? "닉네임 형식이 올바르지 않습니다.",
        type: "format",
      };
    }
    throw error;
  }
}
