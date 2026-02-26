import { ChipButton } from "@/components/shared/chip-button";

/** API region1Depth 매핑 (UI 라벨 → 서버 전체명칭) */
const REGIONS: { label: string; value: string }[] = [
  { label: "서울",  value: "서울특별시" },
  { label: "경기",  value: "경기도" },
  { label: "부산",  value: "부산광역시" },
  { label: "인천",  value: "인천광역시" },
  { label: "대구",  value: "대구광역시" },
  { label: "대전",  value: "대전광역시" },
  { label: "광주",  value: "광주광역시" },
  { label: "울산",  value: "울산광역시" },
  { label: "세종",  value: "세종특별자치시" },
  { label: "강원",  value: "강원특별자치도" },
  { label: "충북",  value: "충청북도" },
  { label: "충남",  value: "충청남도" },
  { label: "전북",  value: "전북특별자치도" },
  { label: "전남",  value: "전라남도" },
  { label: "경북",  value: "경상북도" },
  { label: "경남",  value: "경상남도" },
  { label: "제주",  value: "제주특별자치도" },
];

interface FilterRegionTabProps {
  /** API 전체명칭 (예: "서울특별시") 또는 null */
  regions: string[] | null;
  onToggle: (regionValue: string) => void;
}

export default function FilterRegionTab({ regions, onToggle }: FilterRegionTabProps) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-body-2 font-semibold text-gray-900">지역</span>
      <div className="grid grid-cols-3 gap-2">
        {REGIONS.map(({ label, value }) => (
          <ChipButton
            key={value}
            selected={regions ? regions.includes(value) : false}
            onClick={() => onToggle(value)}
            className="w-full"
          >
            {label}
          </ChipButton>
        ))}
      </div>
    </div>
  );
}
