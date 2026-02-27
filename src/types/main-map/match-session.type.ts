export type MatchSessionExpectedDuration =
  | "TEN_MINUTES"
  | "TWENTY_MINUTES"
  | "OVER_THIRTY_MINUTES"
  | string;

export type MatchSessionRequest = {
  matchRequestId: number;
  status: string;
  specificPlace: string;
  requestMessage: string;
  expectedDuration: MatchSessionExpectedDuration;
};

export type MatchSessionParticipant = {
  userId: number;
  nickname: string;
  gender: string;
  arrived: boolean;
  request: MatchSessionRequest | null;
};

export type MatchSessionData = {
  id: number;
  status: string;
  destination: {
    latitude: number;
    longitude: number;
  } | null;
  matchedAt: string;
  endedAt: string | null;
  me: MatchSessionParticipant;
  partner: MatchSessionParticipant;
};

export type GetMatchSessionResponse = {
  success: boolean;
  message: string;
  code: string;
  data: MatchSessionData;
};
