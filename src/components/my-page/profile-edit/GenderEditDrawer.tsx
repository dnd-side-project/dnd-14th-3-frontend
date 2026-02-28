import { useState } from "react";

import type { Gender } from "@/types/profile";

import { Button } from "@/components/shared/button";
import { ChipButton } from "@/components/shared/chip-button";

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "MALE", label: "남성" },
  { value: "FEMALE", label: "여성" },
];

interface GenderEditDrawerProps {
  initialValue: string;
  onConfirm: (value: Gender) => void;
}

export function GenderEditDrawer({
  initialValue,
  onConfirm,
}: GenderEditDrawerProps) {
  const [selectedGender, setSelectedGender] = useState<Gender | null>(() =>
    GENDER_OPTIONS.some((o) => o.value === initialValue)
      ? (initialValue as Gender)
      : null
  );

  return (
    <div className="flex flex-col grow">
      <div className="flex flex-col items-start gap-3 px-5 py-4 border-b border-gray-100 grow">
        <p className="text-label-1 font-medium text-gray-500">성별</p>
        <div className="flex gap-3 w-full">
          {GENDER_OPTIONS.map(({ value, label }) => {
            const isSelected = selectedGender === value;
            return (
              <ChipButton
                key={value}
                type="button"
                size="medium"
                selected={isSelected}
                onClick={() => setSelectedGender(value)}
                className={`flex-1 rounded-lg py-4 text-body-1 font-bold transition-colors ${
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
          disabled={!selectedGender}
          onClick={() => selectedGender && onConfirm(selectedGender)}
        >
          확인
        </Button.Primary>
      </div>
    </div>
  );
}
