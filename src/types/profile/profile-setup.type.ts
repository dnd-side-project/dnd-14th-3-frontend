import { z } from "zod";

import {
  ageRangeSchema,
  genderSchema,
  nicknameSchema,
  preferredStylesSchema,
} from "./profile-fields.type";

// Profile Schemas
const introductionSchema = z.string().max(100, "자기소개는 100자 이하여야 합니다").optional();

export const profileSubmitSchema = z.object({
  newUsername: nicknameSchema,
  gender: genderSchema,
  ageRange: ageRangeSchema,
  preferredStyles: preferredStylesSchema,
});

export const profileSetupDataSchema = profileSubmitSchema.extend({
  introduction: introductionSchema,
});

/* =====================
 * Type Inference
 * ===================== */
export type ProfileSetupData = z.infer<typeof profileSetupDataSchema>;
export type ProfileSubmitData = z.infer<typeof profileSubmitSchema>;
