import type { FilterValues, ReservationSearchCondition } from "@/types/companion-reservation";

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

/**
 * UI 필터 값(FilterValues) → API 검색 조건(ReservationSearchCondition) 변환
 */
export function mapFilterToCondition(values: FilterValues): ReservationSearchCondition {
  const condition: ReservationSearchCondition = {};

  if (values.regions) condition.region1Depth = values.regions;
  if (values.dateRange.start) condition.date = toISODate(values.dateRange.start);
  if (values.gender) condition.gender = values.gender;
  condition.keyword = values.keyword.trim();

  return condition;
}
