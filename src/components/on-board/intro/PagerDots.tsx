import { motion } from "framer-motion";

const DOT_SIZE = 8;
const DOT_EXTENDED_WIDTH = 32;

interface PagerDotsProps {
  count: number;
  currentIndex: number;
  onSelect: (index: number) => void;
}

export default function PagerDots({ count, currentIndex, onSelect }: PagerDotsProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: count }, (_, stepIndex) => {
        const isActive = stepIndex === currentIndex;
        const targetWidth = isActive ? DOT_EXTENDED_WIDTH : DOT_SIZE;

        return (
          <motion.button
            key={stepIndex}
            type="button"
            onClick={() => {
              if (stepIndex === currentIndex) return;
              onSelect(stepIndex);
            }}
            aria-label={`${stepIndex + 1}번째로 이동`}
            className="rounded-md bg-gray-300 shrink-0 cursor-pointer"
            style={{ height: DOT_SIZE }}
            animate={{
              width: targetWidth,
              backgroundColor: isActive
                ? "var(--color-gray-900)"
                : "var(--color-gray-300)",
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}
