// React Query Key 상수 관리
// 계층적 구조로 관리하여 부분 무효화 가능

export const queryKeys = {
  // User 관련
  user: {
    all: ["user"] as const,
    detail: (id: number) => ["user", id] as const,
    list: (filters?: object) => ["user", "list", filters] as const,
  },

  // 필요한 도메인 추가
  // booking: {
  //   all: ["booking"] as const,
  //   detail: (id: number) => ["booking", id] as const,
  // },
} as const;
