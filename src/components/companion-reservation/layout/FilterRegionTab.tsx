import { REGION_1DEPTH } from "@/constants/companion-reservation/region-1depth";

import { ChipButton } from "@/components/shared/chip-button";

/** REGION_1DEPTH 상수를 배열로 변환 (UI 라벨 → 서버 전체명칭) */
const REGIONS = Object.entries(REGION_1DEPTH).map(([label, value]) => ({
  label,
  value,
}));

interface FilterRegionTabProps {
  /** API 전체명칭 (예: "서울특별시") 또는 null */
  region: string | null;
  onSelect: (regionValue: string) => void;
}

export default function FilterRegionTab({ region, onSelect }: FilterRegionTabProps) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-body-2 font-semibold text-gray-900">지역</span>
      <div className="grid grid-cols-3 gap-2">
        {REGIONS.map(({ label, value }) => (
          <ChipButton
            key={value}
            selected={region === value}
            onClick={() => onSelect(value)}
            className="w-full"
          >
            {label}
          </ChipButton>
        ))}
      </div>
    </div>
  );
}
