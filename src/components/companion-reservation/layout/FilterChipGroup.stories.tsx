import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import type { FilterTab, FilterValues } from "@/types/companion-reservation";

import {
  formatAgeGenderChipLabel,
  formatDateChipLabel,
  formatRegionChipLabel,
} from "@/lib/companion-reservation/filterChipLabel";

import FilterBottomSheet from "./FilterBottomSheet";
import FilterChipGroup from "./FilterChipGroup";

const meta = {
  title: "companion-reservation/FilterChipGroup",
  component: FilterChipGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "동행을 필터링하기 위한 필터 칩 그룹 컴포넌트입니다. 날짜, 지역, 촬영 유형 등의 필터를 선택할 수 있습니다.",
      },
    },
  },
  argTypes: {
    filters: {
      control: "object",
      description: "필터 항목 배열",
    },
  },
} satisfies Meta<typeof FilterChipGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    filters: [],
  },
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<FilterTab>("date");
    const [filterValues, setFilterValues] = useState<FilterValues>({
      date: null,
      ageGroup: null,
      gender: null,
      region: null,
      keyword: "",
    });

    const handleFilterClick = (tab: FilterTab) => {
      setActiveTab(tab);
      setIsOpen(true);
    };

    const handleApply = (values: FilterValues) => {
      setFilterValues(values);
      setIsOpen(false);
      console.log("Applied filters:", values);
    };

    const hasDateFilter = filterValues.date !== null;
    const hasAgeGenderFilter = filterValues.ageGroup !== null || filterValues.gender !== null;
    const hasRegionFilter = filterValues.region !== null;

    return (
      <div className="w-96">
        <FilterChipGroup
          filters={[
            {
              label: formatDateChipLabel(filterValues.date),
              active: hasDateFilter,
              onClick: () => handleFilterClick("date"),
            },
            {
              label: formatAgeGenderChipLabel(filterValues.ageGroup, filterValues.gender),
              active: hasAgeGenderFilter,
              onClick: () => handleFilterClick("age-gender"),
            },
            {
              label: formatRegionChipLabel(filterValues.region),
              active: hasRegionFilter,
              onClick: () => handleFilterClick("region"),
            },
          ]}
        />
        <FilterBottomSheet
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          initialValues={filterValues}
          onApply={handleApply}
        />
      </div>
    );
  },
};
