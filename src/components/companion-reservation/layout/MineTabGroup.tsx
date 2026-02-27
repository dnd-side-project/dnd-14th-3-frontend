import type { MineSubTab } from "@/types/companion-reservation";

export interface MineTabGroupProps {
  activeTab: MineSubTab;
  onTabChange: (tab: MineSubTab) => void;
}

const TABS: { value: MineSubTab; label: string }[] = [
  { value: "posted", label: "내가 올린 요청" },
  { value: "applied", label: "내가 지원한 동행" },
];

export default function MineTabGroup({ activeTab, onTabChange }: MineTabGroupProps) {
  return (
    <div className="flex w-full">
      {TABS.map(({ value, label }) => {
        const isActive = activeTab === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onTabChange(value)}
            className="flex h-14 flex-1 items-center justify-center border-b-2 transition-colors duration-200"
            style={{
              borderColor: isActive ? "var(--color-mint-500)" : "#e6e6e6",
            }}
          >
            <span
              className={`text-body-1 tracking-[0.057px] ${
                isActive ? "font-bold text-gray-900" : "font-medium text-gray-500"
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
