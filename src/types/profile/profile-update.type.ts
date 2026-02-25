import { z } from "zod";

import {
  genderSchema,
  nicknameSchema,
  preferredStylesSchema,
} from "./profile-fields.type";

// Profile Update Schemas (DTO: newUsername, gender, preferredStyles)
export const profileUpdateSchema = z.object({
  newUsername: nicknameSchema,
  gender: genderSchema,
  preferredStyles: preferredStylesSchema,
});

// Type Inference
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
