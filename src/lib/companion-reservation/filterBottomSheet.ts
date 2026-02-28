import type { FilterTab, FilterValues } from "@/types/companion-reservation";

export const DEFAULT_FILTER_VALUES: FilterValues = {
  date: null,
  ageGroup: null,
  gender: null,
  region: null,
  keyword: "",
};

export const FILTER_TAB_LABELS: Record<FilterTab, string> = {
  date: "날짜",
  "age-gender": "나이/성별",
  region: "지역",
};

export const FILTER_TABS: FilterTab[] = ["date", "region", "age-gender"];

export function getFilterCount(tab: FilterTab, values: FilterValues): number {
  switch (tab) {
    case "date":
      return values.date ? 1 : 0;
    case "age-gender":
      return (values.ageGroup ? 1 : 0) + (values.gender ? 1 : 0);
    case "region":
      return values.region ? 1 : 0;
    default:
      return 0;
  }
}

export function hasAnyFilter(values: FilterValues): boolean {
  return (
    values.date !== null ||
    values.ageGroup !== null ||
    values.gender !== null ||
    values.region !== null
  );
}
