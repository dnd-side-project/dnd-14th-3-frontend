import { Gender } from "@/types/profile";
import { REGION_1DEPTH } from "@/constants/companion-reservation/region-1depth";

export function formatDateChipLabel(start: Date | null, end: Date | null): string {
  if (!start) return "날짜";
  const fmt = (d: Date) =>
    `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  return end ? `${fmt(start)} ~ ${fmt(end)}` : fmt(start);
}

const regionOrder = Object.values(REGION_1DEPTH);
 
export function formatRegionChipLabel(regions: string[] | null): string {
  if (!regions?.length) return "지역";
  
  // REGION_1DEPTH에 정의된 순서대로 정렬
 
  const sorted = regions.sort((a, b) => {
    const indexA = regionOrder.indexOf(a);
    const indexB = regionOrder.indexOf(b);
    return indexA - indexB;
  });
  
  // 축약형으로 변환하여 표시
  const reverseMap = Object.fromEntries(
    Object.entries(REGION_1DEPTH).map(([key, value]) => [value, key])
  );
  return sorted.map(r => reverseMap[r] || r).join(", ");
}

export function formatAgeGenderChipLabel(
  ageGroups: string[],
  gender: Gender | null,
): string {
  const items = [
    ...ageGroups.sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
    ...(gender ? [gender === "MALE" ? "남자" : "여자"] : []),
  ];
  if (items.length === 0) return "나이/성별";
  return items.join(", ");
}
