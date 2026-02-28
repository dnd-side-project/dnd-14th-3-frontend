import { useEffect, useState } from "react";

import { X } from "lucide-react";

import { nicknameSchema } from "@/types/profile";

import { useDebounce } from "@/hooks/shared/useDebounce";

import { useValidateNickname } from "@/queries/user";

import { Button } from "@/components/shared/button";

interface NicknameEditDrawerProps {
  initialValue: string;
  onConfirm: (value: string) => void;
}

export function NicknameEditDrawer({
  initialValue,
  onConfirm,
}: NicknameEditDrawerProps) {
  const [inputValue, setInputValue] = useState(initialValue);
  const [formatError, setFormatError] = useState<string | null>(null);

  const debouncedValue = useDebounce(inputValue.trim(), 300);
  const { mutate: validateNickname, data: apiValidation, isPending } = useValidateNickname();

  const formatResult = nicknameSchema.safeParse(debouncedValue);
  const isFormatValid = !debouncedValue || formatResult.success;

  useEffect(() => {
    if (debouncedValue && isFormatValid) {
      validateNickname({ nickname: debouncedValue });
    }
  }, [debouncedValue, isFormatValid, validateNickname]);

  const validateInput = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setFormatError(null);
      return;
    }
    const result = nicknameSchema.safeParse(trimmed);
    if (!result.success) {
      setFormatError(result.error.errors[0]?.message ?? "유효하지 않은 닉네임입니다");
    } else {
      setFormatError(null);
    }
  };

  const isTyping = inputValue.trim() !== debouncedValue;
  const isValidating = isPending || isTyping;
  const apiError = debouncedValue && isFormatValid && apiValidation && !apiValidation.isValid
    ? apiValidation.error
    : null;
  const error = formatError ?? apiError;

  const handleConfirm = () => {
    const trimmed = inputValue.trim();
    const result = nicknameSchema.safeParse(trimmed);
    if (!result.success) {
      setFormatError(result.error.errors[0]?.message ?? "유효하지 않은 닉네임입니다");
      return;
    }
    if (apiValidation && !apiValidation.isValid) {
      return;
    }
    setFormatError(null);
    onConfirm(trimmed);
  };

  return (
    <div className="flex flex-col grow">
      <div className="flex flex-col grow">
        <div className={`flex flex-col items-start gap-1.5 justify-start px-5 py-4 border-b ${error ? "border-warning-500" : "border-gray-100"}`}>
          <p className="text-label-1 font-medium text-gray-500">닉네임</p>
          <div className="flex items-center gap-2 w-full">
            <input
              type="text"
              placeholder="변경할 닉네임을 입력해주세요"
              value={inputValue}
              onChange={(e) => {
                const next = e.target.value;
                setInputValue(next);
                validateInput(next);
              }}
              className="w-full border-gray-200 flex-1 text-body-1 text-gray-900 outline-none"
            />
            <button
              type="button"
              aria-label="입력 내용 지우기"
              onClick={() => {
                setInputValue("");
                setFormatError(null);
              }}
              className="rounded-full bg-gray-400 size-6 shrink-0 flex items-center justify-center"
            >
              <X className="size-3.5 text-white" strokeWidth={4} />
            </button>
          </div>
        </div>
        {error && (
          <p className="text-label-1 text-warning-500 mt-1 px-5">{error}</p>
        )}
      </div>

      <div className="bg-white px-5 py-4">
        <Button.Primary
          fullWidth
          size="large"
          disabled={!inputValue.trim() || !!error || isValidating}
          onClick={handleConfirm}
        >
          {isValidating ? "확인 중..." : "확인"}
        </Button.Primary>
      </div>
    </div>
  );
}
