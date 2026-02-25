import { z } from "zod";

import type { NicknameValidation } from "@/types/profile";

import { logger } from "@/lib/shared/logger";

import { apiClient } from "@/api/client";

// Request / Response Types
export interface ValidateNicknameRequest {
  nickname: string;
}

const validateNicknameSuccessSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  code: z.string().optional(),
  data: z.boolean(),
});

const validateNicknameErrorSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  code: z.string().optional(),
  data: z
    .object({
      fieldErrors: z
        .array(
          z.object({
            field: z.string(),
            message: z.string(),
            code: z.string(),
          })
        )
        .optional(),
    })
    .optional(),
});

export type ValidateNicknameResponse = z.infer<typeof validateNicknameSuccessSchema>;

// Error Parsing
function parseValidationFormatError(error: unknown): NicknameValidation | null {
  const axiosError = error as { response?: { status: number; data?: unknown } };
  if (axiosError.response?.status !== 400) return null;

  const parsed = validateNicknameErrorSchema.safeParse(axiosError.response.data);
  if (!parsed.success || parsed.data.code !== "VALIDATION_FAILED") return null;

  const fieldErrors = parsed.data.data?.fieldErrors ?? [];
  const nicknameError = fieldErrors.find((fe) => fe.field === "nickname");

  return {
    isValid: false,
    error: nicknameError?.message ?? "닉네임 형식이 올바르지 않습니다.",
    type: "format",
  };
}

// API
export async function validateNicknameApi(
  req: ValidateNicknameRequest
): Promise<NicknameValidation> {
  try {
    const response = await apiClient.post<unknown>("/api/v1/users/check-nickname", req);
    const parsed = validateNicknameSuccessSchema.safeParse(response.data);

    if (!parsed.success) {
      const error = new Error(`[validateNicknameApi] API 응답 검증 실패: ${parsed.error.message}`);
      logger.error(error, {
        scope: "profile-api",
        rawResponse: response.data,
        zodIssues: parsed.error.issues,
      });
      throw error;
    }

    const { success, message, data } = parsed.data;

    if (success && data === false) {
      return {
        isValid: false,
        error: message ?? "이미 사용 중인 닉네임입니다.",
        type: "duplicate",
      };
    }

    return { isValid: true };
  } catch (error: unknown) {
    const formatError = parseValidationFormatError(error);
    if (formatError) return formatError;

    if (error instanceof Error) {
      logger.error(error, { scope: "profile-api" });
    }
    throw error;
  }
}
