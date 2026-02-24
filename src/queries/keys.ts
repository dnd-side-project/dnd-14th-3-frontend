export const queryKeys = {
  auth: {
    validate: (accessToken: string) => ["auth", "validate", accessToken] as const,
  },
  user: {
    all: ["user"] as const,
    consents: ["user", "consents"] as const,
    detail: (id: number) => ["user", id] as const,
    list: (filters?: object) => ["user", "list", filters] as const,
    profile: ["user", "profile"] as const,
  },
  onboard: {
    shootingStyles: ["on-board", "shooting-styles"] as const,
    validateNickname: (nickname: string) => ["on-board", "validate-nickname", nickname] as const,
    submitProfile: () => ["on-board", "submit-profile"] as const,
  },
} as const;
