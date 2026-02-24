import type { NicknameValidation } from "@/types/on-board";

import { apiClient } from "@/api/client";

export interface ValidateNicknameRequest {
  nickname: string;
}

export interface ValidateNicknameResponse {
  success: boolean;
  message?: string;
  code?: string;
  data: boolean;
}

interface ValidateNicknameFieldError {
  field: string;
  message: string;
  code: string;
}

interface ValidateNicknameErrorResponse {
  success: boolean;
  message?: string;
  code?: string;
  data?: {
    fieldErrors?: ValidateNicknameFieldError[];
  };
}

export async function validateNicknameApi(
  req: ValidateNicknameRequest
): Promise<NicknameValidation> {
  try {
    const response = await apiClient.post<ValidateNicknameResponse>(
      "/api/v1/users/check-nickname",
      req
    );

    const { success, message, data } = response.data;

    if (success && data === false) {
      return {
        isValid: false,
        error: message ?? "이미 사용 중인 닉네임입니다.",
        type: "duplicate",
      };
    }

    return { isValid: true };
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { status: number; data?: ValidateNicknameErrorResponse };
    };

    if (
      axiosError.response?.status === 400 &&
      axiosError.response?.data?.code === "VALIDATION_FAILED"
    ) {
      const fieldErrors = axiosError.response.data.data?.fieldErrors ?? [];
      const nicknameError = fieldErrors.find((fieldError) => fieldError.field === "nickname");

      return {
        isValid: false,
        error: nicknameError?.message ?? "닉네임 형식이 올바르지 않습니다.",
        type: "format",
      };
    }

    throw error;
  }
}
