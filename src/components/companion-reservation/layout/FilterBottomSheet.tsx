import { X } from "lucide-react";

import type { FilterTab, FilterValues } from "@/types/companion-reservation";

import {
  FILTER_TAB_LABELS,
  FILTER_TABS,
  getFilterCount,
} from "@/lib/companion-reservation/filterBottomSheet";

import { useFilterBottomSheetState } from "@/hooks/companion-reservation/useFilterBottomSheetState";

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
  const {
    values,
    bottomSheet,
    isActionDisabled,
    handleDateChange,
    handleSelectAge,
    handleSelectGender,
    handleSelectRegion,
    handleReset,
    handleClose,
    handleApply,
  } = useFilterBottomSheetState({
    isOpen,
    initialValues,
    onClose,
    onApply,
  });

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
            {FILTER_TABS.map((tab) => {
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
                  {FILTER_TAB_LABELS[tab]}
                  {count > 0 ? ` ${count}` : ""}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="py-6 min-h-80">
            {activeTab === "date" && (
              <FilterDateTab date={values.date} onChange={handleDateChange} />
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
            disabled={isActionDisabled}
          >
            초기화
          </Button.Secondary>
          <Button.Primary
            size="large"
            fullWidth
            disabled={isActionDisabled}
            onClick={handleApply}
          >
            적용
          </Button.Primary>
        </div>
      )}
    />
  );
}
