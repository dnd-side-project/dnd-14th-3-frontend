import { motion, type MotionValue, type PanInfo } from "framer-motion";

import type { ReactNode } from "react";

interface PagerTrackProps {
  x: MotionValue<number>;
  totalSlides: number;
  slideWidth: number;
  onDragEnd: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
  children: ReactNode;
}

export default function PagerTrack({
  x,
  slideWidth,
  totalSlides,
  onDragEnd,
  children,
}: PagerTrackProps) {
  const dragConstraints = {
    left: -(totalSlides - 1) * slideWidth,
    right: 0,
  };

  return (
    <motion.div
      className="flex cursor-grab active:cursor-grabbing"
      style={{ x, willChange: "transform" }}
      drag="x"
      dragConstraints={dragConstraints}
      dragElastic={0.12}
      onDragEnd={onDragEnd}
    >
      {children}
    </motion.div>
  );
}
