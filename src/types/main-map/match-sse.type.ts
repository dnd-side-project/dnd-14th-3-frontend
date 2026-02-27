export type MatchProposalEventData = {
  id: number;
  userAId: number;
  userBId: number;
  status: string;
  userADecision: string;
  userBDecision: string;
};

export type MatchSessionEventData = {
  id: number;
  userAId: number;
  userBId: number;
};

export type MatchRequestExpiredEventData = {
  userId: number;
  matchRequestId: number;
  expiresAt: string;
};

export type MatchRequestWaitingCountEventData = {
  nearbyWaitingCount: number;
};

export type SseConnection = {
  close: () => void;
};
