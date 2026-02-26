import { useState } from "react";

import type { FilterTab } from "@/types/companion-reservation";

import {
  formatAgeGenderChipLabel,
  formatDateChipLabel,
  formatRegionChipLabel,
} from "@/lib/companion-reservation/filterChipLabel";

import { useFilterStore } from "@/store/companion-reservation";

import FilterChipGroup from "./FilterChipGroup";
import FilterBottomSheet from "./FilterBottomSheet";

export default function FilterArea() {
  const { values, setValues } = useFilterStore();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>("date");

  const openFilter = (tab: FilterTab) => {
    setActiveTab(tab);
    setIsOpen(true);
  };

  return (
    <>
      <div className="w-full overflow-x-auto scrollbar-hide">
        <FilterChipGroup
          filters={[
            {
              label: formatDateChipLabel(values.dateRange.start, values.dateRange.end),
              active: !!values.dateRange.start,
              onClick: () => openFilter("date"),
            },
            {
              label: formatRegionChipLabel(values.regions),
              active: !!values.regions && values.regions.length > 0,
              onClick: () => openFilter("region"),
            },
            {
              label: formatAgeGenderChipLabel(values.ageGroups, values.gender),
              active: values.ageGroups.length > 0 || !!values.gender,
              onClick: () => openFilter("age-gender"),
            },
          ]}
        />
      </div>
      <FilterBottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        initialValues={values}
        onApply={(newValues) => {
          setValues(newValues);
          setIsOpen(false);
        }}
      />
    </>
  );
}
