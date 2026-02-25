import { apiClient } from "@/api/client";

export async function cancelMatchRequestApi(): Promise<void> {
  await apiClient.delete("/api/v1/match-requests/me");
}
