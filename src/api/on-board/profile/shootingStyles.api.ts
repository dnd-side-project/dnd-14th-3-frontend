import type { ShootingStyle } from "@/types/on-board";

import { apiClient } from "@/api/client";

export interface ShootingStylesApiResponse {
  styles: ShootingStyle[];
}

export async function fetchShootingStylesApi(): Promise<ShootingStyle[]> {
  const response = await apiClient.get<ShootingStylesApiResponse>(
    "/api/v1/profile/shooting-styles"
  );
  return response.data.styles;
}
