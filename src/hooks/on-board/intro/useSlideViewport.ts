import { useEffect, useRef, useState } from "react";

const INITIAL_SLIDE_WIDTH = 335;

export function useSlideViewport() {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [slideWidth, setSlideWidth] = useState(INITIAL_SLIDE_WIDTH);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const updateSlideWidth = () => {
      if (!viewportRef.current) return;
      const w = viewportRef.current.offsetWidth;
      if (w > 0) setSlideWidth(w);
    };

    updateSlideWidth();
    const observer = new ResizeObserver(updateSlideWidth);
    observer.observe(el);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") updateSlideWidth();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return { viewportRef, slideWidth };
}
