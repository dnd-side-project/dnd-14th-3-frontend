import { useCallback, useEffect } from "react";

import { animate, type MotionValue, type PanInfo } from "framer-motion";

const SWIPE_THRESHOLD_RATIO = 0.2;
const FAST_SWIPE_VELOCITY = 500;

const SPRING = {
  type: "spring" as const,
  stiffness: 420,
  damping: 38,
  mass: 0.9,
};

export function usePagerSpring(
  x: MotionValue<number>,
  index: number,
  slideWidth: number
) {
  useEffect(() => {
    const controls = animate(x, -index * slideWidth, SPRING);
    return () => controls.stop();
  }, [x, index, slideWidth]);
}

export function usePagerDrag(
  x: MotionValue<number>,
  index: number,
  slideWidth: number,
  totalSlides: number,
  setIndex: (index: number) => void
) {
  return useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const dragThreshold = slideWidth * SWIPE_THRESHOLD_RATIO;
      const baseX = -index * slideWidth;
      const dragDistance = x.get() - baseX;

      let nextIndex = index;
      if (dragDistance <= -dragThreshold || info.velocity.x <= -FAST_SWIPE_VELOCITY) {
        nextIndex = index + 1;
      } else if (dragDistance >= dragThreshold || info.velocity.x >= FAST_SWIPE_VELOCITY) {
        nextIndex = index - 1;
      }

      const boundedIndex = Math.max(0, Math.min(nextIndex, totalSlides - 1));

      if (boundedIndex === index) {
        animate(x, baseX, SPRING);
        return;
      }

      setIndex(boundedIndex);
    },
    [x, index, slideWidth, totalSlides, setIndex]
  );
}
