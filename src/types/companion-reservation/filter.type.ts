import type { Gender } from "../profile";

export type FilterTab = "date" | "age-gender" | "region";

export interface FilterValues {
  date: Date | null;
  ageGroup: string | null;  // UI 전용 (API 미전송)
  gender: Gender | null;
  /** API region1Depth 매핑값 (예: "서울특별시") */
  region: string | null;
  keyword: string;
}
