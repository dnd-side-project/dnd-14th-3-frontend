import { useState } from "react";

import { Button } from "@/components/shared/button";

interface IntroductionEditDrawerProps {
  initialValue: string;
  onConfirm: (value: string) => void;
}

export function IntroductionEditDrawer({ initialValue, onConfirm }: IntroductionEditDrawerProps) {
  const [inputValue, setInputValue] = useState(initialValue);

  return (
    <div className="flex flex-col grow">
      <div className="flex flex-col items-start gap-1.5 px-5 py-4 border-b border-gray-100 grow">
        <p className="text-label-1 font-medium text-gray-500">자기소개</p>
        <textarea
          placeholder="자기소개를 입력해주세요"
          value={inputValue}
          maxLength={100}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full min-h-28 resize-none rounded-md border border-gray-200 px-3 py-2 text-body-1 text-gray-900 outline-none"
        />
        <p className="w-full text-right text-caption-1 text-gray-400">{inputValue.length}/100</p>
      </div>
      <div className="bg-white px-5 py-4">
        <Button.Primary fullWidth size="large" onClick={() => onConfirm(inputValue.trim())}>
          확인
        </Button.Primary>
      </div>
    </div>
  );
}
