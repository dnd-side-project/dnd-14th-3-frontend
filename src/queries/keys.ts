export const queryKeys = {
  auth: {
    validate: (pathname: string) => ["auth", "validate", pathname] as const,
  },
  user: {
    all: ["user"] as const,
    detail: (id: number) => ["user", id] as const,
    list: (filters?: object) => ["user", "list", filters] as const,
  },
} as const;

