import type { NicknameValidation } from "@/types/profile";

import { logger } from "@/lib/shared/logger";

import { apiClient } from "@/api/client";

// Request / Response Types
export interface ValidateNicknameRequest {
  nickname: string;
}

export type ValidateNicknameResponse =
  | {
      success: true;
      message: string | undefined;
      code: string | undefined;
      data: boolean;
    }
  | {
      success: false;
      message: string | undefined;
      code: string | undefined;
      data: {
        fieldErrors: {
          field: string;
          message: string;
          code: string;
        }[];
      };
    };

// API
export async function validateNicknameApi(
  req: ValidateNicknameRequest
): Promise<NicknameValidation> {
  try {
    const response = await apiClient.post<ValidateNicknameResponse>(
      "/api/v1/users/check-nickname",
      req
    );

    if (!response.data.success) {
      if (response.data.data.fieldErrors) {
        return {
          isValid: false,
          error: response.data.data.fieldErrors[0].message,
          type: response.data.data.fieldErrors[0].code ?? "UNKNOWN_ERROR",
        };
      }
    }

    return { isValid: true };
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(error, { scope: "profile-api" });
    }
    throw error;
  }
}
