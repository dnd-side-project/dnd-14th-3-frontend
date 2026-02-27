export const queryKeys = {
  match: {
    all: ["match"] as const,
    request: (matchRequestId: number) => ["match", "request", matchRequestId] as const,
    requestStatus: (matchRequestId: number) => ["match", "request-status", matchRequestId] as const,
    session: (sessionId: number) => ["match", "session", sessionId] as const,
    proposals: ["match", "proposals"] as const,
  },
  user: {
    all: ["user"] as const,
    consents: (userId?: string | null) => ["user", "consents", userId ?? "none"] as const,
    detail: (id: number) => ["user", id] as const,
    list: (filters?: object) => ["user", "list", filters] as const,
    profile: (userId?: string | null) => ["user", "profile", userId ?? "none"] as const,
    photoStyles: ["user", "photo-styles"] as const,
  },
  onboard: {
    validateNickname: (nickname: string) => ["on-board", "validate-nickname", nickname] as const,
  },
} as const;
