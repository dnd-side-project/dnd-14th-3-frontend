import { useEffect, useState } from "react";

import { X } from "lucide-react";

import type { FilterTab, FilterValues } from "@/types/companion-reservation";
import { Gender } from "@/types/profile";

import { useBottomSheet } from "@/hooks/shared/bottom-sheet";

import { BottomSheet } from "@/components/shared/bottom-sheet";
import { Button } from "@/components/shared/button";

import FilterAgeGenderTab from "./FilterAgeGenderTab";
import FilterDateTab from "./FilterDateTab";
import FilterRegionTab from "./FilterRegionTab";

/* =====================
 * Re-exports (for existing consumers)
 * ===================== */
export type { FilterTab, FilterValues };

export interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
  initialValues?: FilterValues;
  onApply: (values: FilterValues) => void;
}

/* =====================
 * Constants
 * ===================== */
const TAB_LABELS: Record<FilterTab, string> = {
  date: "날짜",
  "age-gender": "나이/성별",
  region: "지역",
};

const TABS: FilterTab[] = ["date", "region", "age-gender"];

/* =====================
 * Helpers
 * ===================== */
function getFilterCount(tab: FilterTab, values: FilterValues): number {
  switch (tab) {
    case "date":
      return values.date ? 1 : 0;
    case "age-gender":
      return (values.ageGroup ? 1 : 0) + (values.gender ? 1 : 0);
    case "region":
      return values.region ? 1 : 0;
    default:
      return 0;
  }
}

function hasAnyFilter(values: FilterValues): boolean {
  return (
    values.date !== null ||
    values.ageGroup !== null ||
    values.gender !== null ||
    values.region !== null
  );
}

/* =====================
 * FilterBottomSheet
 * ===================== */
export default function FilterBottomSheet({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  initialValues,
  onApply,
}: FilterModalProps) {
  const [values, setValues] = useState<FilterValues>(
    initialValues ?? {
      date: null,
      ageGroup: null,
      gender: null,
      region: null,
      keyword: "",
    }
  );
  const { open: openBottomSheet, close: closeBottomSheet, ...bottomSheet } = useBottomSheet();

  // 모달이 열릴 때마다 최신 저장값으로 동기화
  useEffect(() => {
    if (isOpen) {
      openBottomSheet();
    }
  }, [isOpen, openBottomSheet]);

  const handleSelectAge = (age: string) => {
    setValues((prev) => ({
      ...prev,
      ageGroup: prev.ageGroup === age ? null : age,
    }));
  };

  const handleSelectGender = (gender: Gender) => {
    setValues((prev) => ({
      ...prev,
      gender: prev.gender === gender ? null : gender,
    }));
  };

  const handleSelectRegion = (region: string) => {
    setValues((prev) => ({
      ...prev,
      region: prev.region === region ? null : region,
    }));
  };

  const handleReset = () => {
    setValues({
      date: null,
      ageGroup: null,
      gender: null,
      region: null,
      keyword: "",
    });
    closeBottomSheet();
  };
  const handleClose = () => {
    onClose();
    closeBottomSheet();
  };

  const handleApply = () => {
    onApply(values);
    closeBottomSheet();
  };

  return (
    <BottomSheet
      {...bottomSheet}
      initialSnap="full"
      onClose={handleClose}
      draggable={true}
      showBackdrop
      backdropClick="close"
      header={({ close }) => (
        <div className="flex h-14.5 items-center px-5 relative">
          <span className="absolute left-1/2 -translate-x-1/2 text-body-1 font-semibold text-gray-900">
            필터
          </span>
          <button
            type="button"
            onClick={close}
            className="ml-auto p-1 text-gray-700"
            aria-label="닫기"
          >
            <X size={24} />
          </button>
        </div>
      )}
      renderContent={() => (
        <div className="flex flex-col">
          {/* Filter Tabs */}
          <div className="flex px-5 gap-1 border-b border-gray-100">
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              const count = getFilterCount(tab, values);
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => onTabChange(tab)}
                  className={`px-2.5 py-2.5 text-body-2 transition-colors ${
                    isActive
                      ? "font-bold text-gray-900 border-b-2 border-mint-500"
                      : "font-medium text-gray-400"
                  }`}
                >
                  {TAB_LABELS[tab]}
                  {count > 0 ? ` ${count}` : ""}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="py-6 min-h-80">
            {activeTab === "date" && (
              <FilterDateTab
                date={values.date}
                onChange={(date) => setValues((prev) => ({ ...prev, date }))}
              />
            )}
            {activeTab === "age-gender" && (
              <div className="px-5">
                <FilterAgeGenderTab
                  ageGroup={values.ageGroup}
                  gender={values.gender}
                  onSelectAge={handleSelectAge}
                  onSelectGender={handleSelectGender}
                />
              </div>
            )}
            {activeTab === "region" && (
              <div className="px-5">
                <FilterRegionTab region={values.region} onSelect={handleSelectRegion} />
              </div>
            )}
          </div>
        </div>
      )}
      footer={() => (
        <div className="flex flex-col gap-3 px-3 pb-5 pt-3">
          <Button.Secondary
            size="large"
            fullWidth
            onClick={handleReset}
            disabled={!hasAnyFilter(values)}
          >
            초기화
          </Button.Secondary>
          <Button.Primary
            size="large"
            fullWidth
            disabled={!hasAnyFilter(values)}
            onClick={handleApply}
          >
            적용
          </Button.Primary>
        </div>
      )}
    />
  );
}
