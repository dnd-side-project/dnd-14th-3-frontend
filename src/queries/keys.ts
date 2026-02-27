export const queryKeys = {
  auth: {
    validate: (accessToken: string) => ["auth", "validate", accessToken] as const,
  },
  user: {
    all: ["user"] as const,
    consents: (userId?: string | null) => ["user", "consents", userId ?? "none"] as const,
    detail: (id: number) => ["user", id] as const,
    list: (filters?: object) => ["user", "list", filters] as const,
    profile: (userId?: string | null) => ["user", "profile", userId ?? "none"] as const,
    photoStyles: ["user", "photo-styles"] as const,
  },
  reservation: {
    list: (condition?: object, limit?: number) => ["reservation", "list", condition, limit] as const,
    detail: (reservationId: number) => ["reservation", "detail", reservationId] as const,
    applicants: (reservationId: number) => ["reservation", "applicants", reservationId] as const,
    comments: (reservationId: number, cursor?: number, limit?: number) =>
      ["reservation", "comments", reservationId, cursor, limit] as const,
    mine: {
      posted: (cursor?: number, limit?: number) =>
        ["reservation", "mine", "posted", cursor, limit] as const,
      applied: (cursor?: number, limit?: number) =>
        ["reservation", "mine", "applied", cursor, limit] as const,
    },
  },
  onboard: {
    shootingStyles: ["on-board", "shooting-styles"] as const,
    validateNickname: (nickname: string) => ["on-board", "validate-nickname", nickname] as const,
    submitProfile: () => ["on-board", "submit-profile"] as const,
  },
} as const;
