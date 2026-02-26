export type MatchExpectedDuration = "TEN_MINUTES" | "TWENTY_MINUTES" | "OVER_THIRTY_MINUTES";

export interface CreateMatchRequestPayload {
  location: {
    latitude: number;
    longitude: number;
  };
  specificPlace: string;
  requestMessage: string;
  expectedDuration: MatchExpectedDuration;
}

export interface CreateMatchRequestData {
  matchRequestId: number;
  status: "WAITING" | "MATCHED" | "CANCELLED" | "EXPIRED";
  specificPlace: string;
  location: {
    latitude: number;
    longitude: number;
  };
  expectedDuration: MatchExpectedDuration | string;
  requestMessage: string;
  createdAt: string;
  updatedAt: string;
  nearbyWaitingCount?: number;
}

export interface CreateMatchRequestResponse {
  success: boolean;
  message: string;
  code: string;
  data: CreateMatchRequestData;
}
