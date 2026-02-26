import { ChipButton } from "@/components/shared/chip-button";
import type { Gender } from "@/types/profile";

const AGE_GROUPS = ["10대", "20대", "30대", "40대", "50대+"];

interface FilterAgeGenderTabProps {
  ageGroups: string[];
  gender: Gender | null;
  onToggleAge: (age: string) => void;
  onToggleGender: (gender: Gender) => void;
}

export default function FilterAgeGenderTab({
  ageGroups,
  gender,
  onToggleAge,
  onToggleGender,
}: FilterAgeGenderTabProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* 나이 */}
      <div className="flex flex-col gap-3">
        <span className="text-body-2 font-semibold text-gray-900">나이</span>
        <div className="flex flex-wrap gap-2">
          {AGE_GROUPS.map((age) => (
            <ChipButton
              key={age}
              selected={ageGroups.includes(age)}
              onClick={() => onToggleAge(age)}
            >
              {age}
            </ChipButton>
          ))}
        </div>
      </div>

      {/* 성별 */}
      <div className="flex flex-col gap-3">
        <span className="text-body-2 font-semibold text-gray-900">성별</span>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onToggleGender("MALE")}
            className={`flex-1 h-13 rounded-xl text-body-1 font-bold transition-colors ${
              gender === "MALE" ? "bg-mint-500 text-black" : "bg-gray-100 text-gray-700"
            }`}
          >
            남자
          </button>
          <button
            type="button"
            onClick={() => onToggleGender("FEMALE")}
            className={`flex-1 h-13 rounded-xl text-body-1 font-bold transition-colors ${
              gender === "FEMALE" ? "bg-mint-500 text-black" : "bg-gray-100 text-gray-700"
            }`}
          >
            여자
          </button>
        </div>
      </div>
    </div>
  );
}
