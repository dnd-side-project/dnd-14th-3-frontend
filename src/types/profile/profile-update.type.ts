import { z } from "zod";

import {
  ageRangeSchema,
  genderSchema,
  nicknameSchema,
  preferredStylesSchema,
} from "./profile-fields.type";

// Profile Update Schemas (DTO: nickname, gender, ageGroup, introduction, photoStyles)
export const profileUpdateSchema = z.object({
  nickname: nicknameSchema,
  gender: genderSchema,
  ageGroup: ageRangeSchema,
  introduction: z.string(),
  profileImageUrl: z.string().optional(),
  photoStyles: preferredStylesSchema,
});

// Type Inference
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
