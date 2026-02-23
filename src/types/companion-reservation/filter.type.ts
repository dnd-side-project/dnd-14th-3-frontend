import type { Gender } from "../profile";

export type FilterTab = "date" | "age-gender" | "region";

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface FilterValues {
  dateRange: DateRange;
  ageGroups: string[];  // UI 전용 (API 미전송)
  gender: Gender | null;
  /** API region1Depth 매핑값 (예: "SEOUL") */
  regions: string[] | null;
  keyword: string;
}
