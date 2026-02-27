import { useState } from "react";

import type { AgeRange } from "@/types/profile";

import { Button } from "@/components/shared/button";
import { ChipButton } from "@/components/shared/chip-button";

const AGE_GROUP_OPTIONS: { value: AgeRange; label: string }[] = [
  { value: "TEENS", label: "10대" },
  { value: "TWENTIES", label: "20대" },
  { value: "THIRTIES", label: "30대" },
  { value: "FORTIES", label: "40대" },
  { value: "FIFTIES_AND_ABOVE", label: "50대 이상" },
];

interface AgeGroupEditDrawerProps {
  initialValue: string;
  onConfirm: (value: AgeRange) => void;
}

export function AgeGroupEditDrawer({ initialValue, onConfirm }: AgeGroupEditDrawerProps) {
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeRange | null>(() =>
    AGE_GROUP_OPTIONS.some((option) => option.value === initialValue)
      ? (initialValue as AgeRange)
      : null
  );

  return (
    <div className="flex flex-col grow">
      <div className="flex flex-col items-start gap-3 px-5 py-4 border-b border-gray-100 grow">
        <p className="text-label-1 font-medium text-gray-500">연령대</p>
        <div className="flex flex-wrap gap-3 w-full">
          {AGE_GROUP_OPTIONS.map(({ value, label }) => {
            const isSelected = selectedAgeGroup === value;
            return (
              <ChipButton
                key={value}
                type="button"
                size="medium"
                selected={isSelected}
                onClick={() => setSelectedAgeGroup(value)}
                className={`rounded-lg px-5 py-4 text-body-1 font-bold transition-colors ${
                  isSelected ? "bg-mint-500 text-gray-900" : "bg-gray-50 text-gray-500"
                }`}
              >
                {label}
              </ChipButton>
            );
          })}
        </div>
      </div>
      <div className="bg-white px-5 py-4">
        <Button.Primary
          fullWidth
          size="large"
          disabled={!selectedAgeGroup}
          onClick={() => selectedAgeGroup && onConfirm(selectedAgeGroup)}
        >
          확인
        </Button.Primary>
      </div>
    </div>
  );
}
