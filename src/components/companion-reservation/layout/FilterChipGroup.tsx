import { ChevronDown } from "lucide-react";

export interface FilterChipProps {
	label: string;
	active?: boolean;
	onClick: () => void;
}

export interface FilterChipGroupProps {
	filters: FilterChipProps[];
}

function FilterChip({ label, active = false, onClick }: FilterChipProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`flex items-center gap-1 rounded-4xl border px-3 py-2 text-sm transition-colors ${
				active
					? "border-mint-500 text-mint-500"
					: "border-gray-200 text-gray-600 hover:border-gray-300"
			}`}
		>
			<span>{label}</span>
			<ChevronDown className={`size-4 ${active ? "text-mint-500" : ""}`} />
		</button>
	);
}

export default function FilterChipGroup({ filters }: FilterChipGroupProps) {
	return (
		<div className="flex w-max items-center gap-1">
			{filters.map((filter) => (
				<FilterChip key={filter.label} {...filter} />
			))}
		</div>
	);
}
