import { motion } from "framer-motion";

import type { ViewSegment } from "@/types/companion-reservation";

export interface SegmentedControlProps {
  activeTab: ViewSegment;
  onTabChange: (tab: ViewSegment) => void;
}

const TABS: { value: ViewSegment; label: string }[] = [
  { value: "browse", label: "동행" },
  { value: "mine", label: "내 동행" },
];

export default function SegmentedControl({ activeTab, onTabChange }: SegmentedControlProps) {
  return (
    <div className="flex gap-2 rounded-md bg-gray-50 p-1.5">
      {TABS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => onTabChange(value)}
          className="relative flex-1 rounded-md py-1.5 text-sm"
        >
          {activeTab === value && (
            <motion.div
              layoutId="segmented-control-indicator"
              className="absolute inset-0 rounded-md bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)]"
              transition={{ type: "tween", stiffness: 400, damping: 30 }}
            />
          )}
          <span
            className={`relative z-10 ${activeTab === value ? "font-semibold text-gray-900" : "font-normal text-gray-600"}`}
          >
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}
