import { AgeRange,Gender  } from "@/types/on-board";

import { apiClient } from "@/api/client";

export interface SubmitProfileRequest {
  newUsername: string;
  gender: Gender;
  preferredStyles: string[];
  ageRange: AgeRange;
  introduction?: string;
}

export async function submitProfileApi(
  payload: SubmitProfileRequest
): Promise<unknown> {
  const { ...body } = payload;
  const response = await apiClient.patch(`/api/v1/users/profiles`, body);
  return response.data;
}
