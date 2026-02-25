import { z } from "zod";

import type { ProfileSetupStep } from "@/types/on-board";
import {
  ageRangeSchema,
  genderSchema,
  nicknameSchema,
} from "@/types/profile";

const preferredStylesSchema = z
  .array(z.string())
  .min(1, "최소 1개 이상 선택해주세요")
  .refine((arr) => new Set(arr).size === arr.length, "중복된 스타일이 있습니다");

const STEP_SCHEMAS: Record<
  Exclude<ProfileSetupStep, "introduction">,
  z.ZodTypeAny
> = {
  nickname: nicknameSchema,
  gender: genderSchema,
  "shooting-style": preferredStylesSchema,
  "age-range": ageRangeSchema,
};

export function validateProfileSetupStep(
  step: ProfileSetupStep,
  value: unknown
): boolean {
  if (step === "introduction") return true;

  const schema = STEP_SCHEMAS[step];
  const input = step === "nickname" ? (value ?? "") : value;
  return schema.safeParse(input).success;
}
