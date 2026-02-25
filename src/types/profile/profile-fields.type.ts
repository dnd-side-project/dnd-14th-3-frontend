import { z } from "zod";

import { AGE_RANGE_ENUM, GENDER_ENUM } from "@/constants/user";

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

export const genderSchema = z.enum(
  Object.values(GENDER_ENUM) as [string, ...string[]]
);

export const ageRangeSchema = z.enum(
  Object.values(AGE_RANGE_ENUM) as [string, ...string[]]
);

export const preferredStylesSchema = z
  .array(z.string())
  .min(1, "최소 1개 이상 선택해주세요")
  .refine((arr) => new Set(arr).size === arr.length, "중복된 스타일이 있습니다");

/** 서버에서 받아오는 포토 스타일 항목: { id, label }[] (API: /photo-style) */
export const photoStyleSchema = z.object({
  id: z.string(),
  label: z.string(),
});

/* =====================
 * Type Inference
 * ===================== */
export type Gender = z.infer<typeof genderSchema>;
export type AgeRange = z.infer<typeof ageRangeSchema>;
export type PhotoStyle = z.infer<typeof photoStyleSchema>;
export type PhotoStyleId = string;

/* =====================
 * Validation Types
 * ===================== */
export interface NicknameValidation {
  isValid: boolean;
  error?: string;
  type?: "format" | "duplicate" | "forbidden";
}

export interface PhotoStylesResponse {
  styles: PhotoStyle[];
}
