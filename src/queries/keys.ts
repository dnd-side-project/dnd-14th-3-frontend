export const queryKeys = {
  auth: {
    validate: (accessToken: string) => ["auth", "validate", accessToken] as const,
  },
  user: {
    all: ["user"] as const,
    detail: (id: number) => ["user", id] as const,
    list: (filters?: object) => ["user", "list", filters] as const,
  },
} as const;
