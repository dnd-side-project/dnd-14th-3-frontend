import { z } from "zod";

import {
  AGE_RANGE_ENUM,
  GENDER_ENUM,
  PROFILE_SETUP_STEPS,
} from "@/constants/on-board";

/* =====================
 * Zod Schemas
 * ===================== */
export const nicknameSchema = z
  .string()
  .min(2, "닉네임은 2자 이상이어야 합니다")
  .max(15, "닉네임은 15자 이하여야 합니다")
  .regex(
    /^[가-힣a-zA-Z0-9]+$/,
    "한글, 영문, 숫자만 사용 가능합니다"
  );

const introductionSchema = z
  .string()
  .max(100, "자기소개는 100자 이하여야 합니다")
  .optional();

export const genderSchema = z.enum(
  Object.values(GENDER_ENUM) as [string, ...string[]]
);

export const ageRangeSchema = z.enum(
  Object.values(AGE_RANGE_ENUM) as [string, ...string[]]
);

/** 서버에서 받아오는 촬영 스타일 항목: { id, label }[] */
export const shootingStyleSchema = z.object({
  id: z.string(),
  label: z.string(),
});

export const profileSubmitSchema = z.object({
  newUsername: nicknameSchema,
  gender: genderSchema,
  ageRange: ageRangeSchema,
  preferredStyles: z
    .array(z.string())
    .min(1, "최소 1개 이상 선택해주세요")
    .refine((arr) => new Set(arr).size === arr.length, "중복된 스타일이 있습니다"),
});

export const profileSetupDataSchema = profileSubmitSchema.extend({
  introduction: introductionSchema,
});

/* =====================
 * Type Inference
 * ===================== */
export type Gender = z.infer<typeof genderSchema>;
export type AgeRange = z.infer<typeof ageRangeSchema>;
export type ShootingStyle = z.infer<typeof shootingStyleSchema>;
export type ShootingStyleId = string;
export type ProfileSetupData = z.infer<typeof profileSetupDataSchema>;
export type ProfileSubmitData = z.infer<typeof profileSubmitSchema>;

export type ProfileSetupStep = (typeof PROFILE_SETUP_STEPS)[number];

/* =====================
 * Validation Types
 * ===================== */
export interface NicknameValidation {
  isValid: boolean;
  error?: string;
  type?: "format" | "duplicate" | "forbidden";
}

export interface ShootingStylesResponse {
  styles: ShootingStyle[];
}
