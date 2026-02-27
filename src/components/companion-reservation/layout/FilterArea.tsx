import { useState } from "react";

import type { FilterTab } from "@/types/companion-reservation";

import {
  formatAgeGenderChipLabel,
  formatDateChipLabel,
  formatRegionChipLabel,
} from "@/lib/companion-reservation/filterChipLabel";

import { useFilterStore } from "@/store/companion-reservation";

import FilterBottomSheet from "./FilterBottomSheet";
import FilterChipGroup from "./FilterChipGroup";

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
              label: formatDateChipLabel(values.date),
              active: !!values.date,
              onClick: () => openFilter("date"),
            },
            {
              label: formatRegionChipLabel(values.region),
              active: !!values.region,
              onClick: () => openFilter("region"),
            },
            {
              label: formatAgeGenderChipLabel(values.ageGroup, values.gender),
              active: !!values.ageGroup || !!values.gender,
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
