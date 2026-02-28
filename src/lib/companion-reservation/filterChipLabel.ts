import { Gender } from "@/types/profile";

import { REGION_1DEPTH } from "@/constants/companion-reservation/region-1depth";

export function formatDateChipLabel(date: Date | null): string {
  if (!date) return "날짜";
  const currentYear = new Date().getFullYear();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  if (year === currentYear) {
    return `${month}.${day}`;
  }
  return `${year}.${month}.${day}`;
}

const reverseRegionMap = Object.fromEntries(
  Object.entries(REGION_1DEPTH).map(([key, value]) => [value, key])
);

export function formatRegionChipLabel(region: string | null): string {
  if (!region) return "지역";
  return reverseRegionMap[region] || region;
}

export function formatAgeGenderChipLabel(ageGroup: string | null, gender: Gender | null): string {
  const items = [
    ...(ageGroup ? [ageGroup] : []),
    ...(gender ? [gender === "MALE" ? "남자" : "여자"] : []),
  ];
  if (items.length === 0) return "나이/성별";
  return items.join(", ");
}
