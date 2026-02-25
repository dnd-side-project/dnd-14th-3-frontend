export const queryKeys = {
  user: {
    all: ["user"] as const,
    consents: (userId?: string | null) => ["user", "consents", userId ?? "none"] as const,
    detail: (id: number) => ["user", id] as const,
    list: (filters?: object) => ["user", "list", filters] as const,
    profile: (userId?: string | null) => ["user", "profile", userId ?? "none"] as const,
  },
  onboard: {
    shootingStyles: ["on-board", "shooting-styles"] as const,
    validateNickname: (nickname: string) => ["on-board", "validate-nickname", nickname] as const,
  },
} as const;
