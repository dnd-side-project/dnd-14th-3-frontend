import { useCallback, useMemo, useState } from "react";

import { FALLBACK_PHOTO_STYLES } from "@/constants/user";

import { usePhotoStyles } from "@/queries/user";

import { Button } from "@/components/shared/button";
import { ChipButton } from "@/components/shared/chip-button";

interface PhotoStyleEditDrawerProps {
  initialValue: string[];
  onConfirm: (value: string[]) => void;
}

export function PhotoStyleEditDrawer({
  initialValue,
  onConfirm,
}: PhotoStyleEditDrawerProps) {
  const { data: apiStyles, isLoading, isError, refetch } = usePhotoStyles();

  const styles = useMemo(() => {
    if (isError) return FALLBACK_PHOTO_STYLES;
    if (!apiStyles || apiStyles.length === 0) return FALLBACK_PHOTO_STYLES;
    return apiStyles;
  }, [isError, apiStyles]);

  const toggleStyle = useCallback((styleId: string, currentValue: string[]) => {
    if (currentValue.includes(styleId)) {
      return currentValue.filter((id) => id !== styleId);
    }
    return [...currentValue, styleId];
  }, []);

  const [selectedIds, setSelectedIds] = useState<string[]>(initialValue);

  const handleConfirm = () => {
    if (selectedIds.length > 0) {
      onConfirm(selectedIds);
    }
  };

  return (
    <div className="flex flex-col grow">
      <div className="flex flex-col items-start gap-3 px-5 py-4 border-b border-gray-100 grow overflow-y-auto">
        <p className="text-label-1 font-medium text-gray-500">촬영 스타일</p>
        {isLoading && (
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-9 w-24 animate-pulse rounded-md bg-gray-200"
              />
            ))}
          </div>
        )}
        {!isLoading && styles.length > 0 && (
          <>
            {isError && (
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-label-1 text-warning-500">
                  촬영 스타일 목록을 불러오지 못해 기본 목록을 표시합니다.
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="rounded-md px-3 py-1.5 text-label-1 font-medium text-mint-600"
                >
                  다시 시도
                </button>
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              {styles.map((style) => {
                const isSelected = selectedIds.includes(style.name);
                return (
                  <ChipButton
                    key={style.id}
                    selected={isSelected}
                    onClick={() =>
                      setSelectedIds((prev) => toggleStyle(style.name, prev))
                    }
                  >
                    {style.label}
                  </ChipButton>
                );
              })}
            </div>
          </>
        )}
      </div>
      <div className="bg-white px-5 py-4 shrink-0">
        <Button.Primary
          fullWidth
          size="large"
          disabled={selectedIds.length === 0}
          onClick={handleConfirm}
        >
          확인
        </Button.Primary>
      </div>
    </div>
  );
}
