import type { ShootingStyle } from "@/types/on-board";

import { apiClient } from "@/api/client";

interface PhotoStyleItem {
  id: number;
  name: string;
}

export interface ShootingStylesApiResponse {
  success: boolean;
  message: string;
  code: string;
  data: PhotoStyleItem[];
}

export async function fetchShootingStylesApi(): Promise<ShootingStyle[]> {
  const response = await apiClient.get<ShootingStylesApiResponse>("/api/v1/photo-style");

  return response.data.data.map((style) => ({
    id: style.name,
    label: style.name,
  }));
}
