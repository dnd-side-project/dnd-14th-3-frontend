import type { PhotoStyle } from "@/types/profile";

import { logger } from "@/lib/shared/logger";

import { apiClient } from "@/api/client";

/* =====================
 * Zod Schemas
 * ===================== */

export type GetPhotoStylesApiResponse = {
  success: boolean;
  message: string;
  code: string;
  data: { id: string; name: string; label: string }[];
};

/* =====================
 * API
 * ===================== */
export async function getPhotoStylesApi(): Promise<PhotoStyle[]> {
  const response = await apiClient.get<GetPhotoStylesApiResponse>("/api/v1/photo-style");

  if (!response.data.success) {
    logger.error(response.data.message);
    throw new Error(response.data.message);
  }

  return response.data.data.map((style) => ({
    id: style.id,
    name: style.name,
    label: style.label,
  }));
}
