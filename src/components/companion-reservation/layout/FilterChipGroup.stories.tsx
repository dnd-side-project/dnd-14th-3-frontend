import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import FilterChipGroup from "./FilterChipGroup";
import FilterBottomSheet from "./FilterBottomSheet";
import type { FilterTab, FilterValues } from "@/types/companion-reservation";

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
			dateRange: { start: null, end: null },
			ageGroups: [],
			gender: null,
			regions: [],
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

		const hasDateFilter = filterValues.dateRange.start !== null;
		const hasAgeGenderFilter =
			filterValues.ageGroups.length > 0 || filterValues.gender !== null;
		const hasRegionFilter = filterValues.regions && filterValues.regions.length > 0;

		const formatDateRange = () => {
			if (!filterValues.dateRange.start) return "";
			const start = filterValues.dateRange.start.toLocaleDateString("ko-KR", {
				month: "long",
				day: "numeric",
			});
			if (!filterValues.dateRange.end) return start;
			const end = filterValues.dateRange.end.toLocaleDateString("ko-KR", {
				month: "long",
				day: "numeric",
			});
			return `${start} ~ ${end}`;
		};

		const formatAgeGender = () => {
			const parts: string[] = [];
			if (filterValues.ageGroups.length > 0) {
				parts.push(filterValues.ageGroups.join(", "));
			}
			if (filterValues.gender) {
				const genderLabel = filterValues.gender === "MALE" ? "남성" : "여성";
				parts.push(genderLabel);
			}
			return parts.join(", ");
		};

		const formatRegion = () => {
			if (!filterValues.regions || filterValues.regions.length === 0) return "";
			return filterValues.regions.map((r) => regionLabels[r] || r).join(", ");
		};

		const regionLabels: Record<string, string> = {
			서울특별시: "서울",
			경기도: "경기",
			부산광역시: "부산",
			인천광역시: "인천",
			대구광역시: "대구",
			대전광역시: "대전",
			광주광역시: "광주",
			울산광역시: "울산",
			세종특별자치시: "세종",
			강원특별자치도: "강원",
			충청북도: "충북",
			충청남도: "충남",
			전북특별자치도: "전북",
			전라남도: "전남",
			경상북도: "경북",
			경상남도: "경남",
			제주특별자치도: "제주",
		};

		return (
			<div className="w-96">
				<FilterChipGroup
					filters={[
						{
							label: hasDateFilter ? `${formatDateRange()}` : "날짜",
							
							active: hasDateFilter,
							onClick: () => handleFilterClick("date"),
						},
						{
							label: hasAgeGenderFilter ? `${formatAgeGender()}` : "나이/성별",
							active: hasAgeGenderFilter,
							onClick: () => handleFilterClick("age-gender"),
						},
						{
							label: hasRegionFilter ? `${formatRegion()}` : "지역",
							active: hasRegionFilter??false,
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
