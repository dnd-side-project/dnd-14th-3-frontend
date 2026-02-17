import { useCallback, useState } from "react";

export function usePagerState(totalSlides: number) {
  const [index, setIndex] = useState(0);

  const goTo = useCallback(
    (nextIndex: number) => {
      setIndex((prev) => {
        const bounded = Math.max(0, Math.min(nextIndex, totalSlides - 1));
        return prev === bounded ? prev : bounded;
      });
    },
    [totalSlides]
  );

  const isLast = index === totalSlides - 1;

  return { index, setIndex, goTo, isLast };
}
