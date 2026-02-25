import { z } from "zod";

import type { PhotoStyle } from "@/types/profile";

import { logger } from "@/lib/shared/logger";

import { apiClient } from "@/api/client";

/* =====================
 * Zod Schemas
 * ===================== */
const photoStyleItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  label: z.string(),
});

const getPhotoStylesResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  code: z.string(),
  data: z.array(photoStyleItemSchema),
});

export type GetPhotoStylesApiResponse = z.infer<typeof getPhotoStylesResponseSchema>;

/* =====================
 * API
 * ===================== */
export async function getPhotoStylesApi(): Promise<PhotoStyle[]> {
  const response = await apiClient.get<unknown>("/api/v1/photo-style");

  const parsed = getPhotoStylesResponseSchema.safeParse(response.data);

  if (!parsed.success) {
    const error = new Error(`[getPhotoStylesApi] API 응답 검증 실패: ${parsed.error.message}`);
    logger.error(error, {
      scope: "profile-api",
      rawResponse: response.data,
      zodIssues: parsed.error.issues,
    });
    throw error;
  }

  return parsed.data.data.map((style) => ({
    id: style.name,
    label: style.label,
  }));
}
