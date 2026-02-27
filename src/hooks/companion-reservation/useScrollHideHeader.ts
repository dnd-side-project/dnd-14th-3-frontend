import { useEffect, useRef, useState } from "react";

const HIDE_THRESHOLD = 60;
const SHOW_THRESHOLD = 10;

interface UseScrollHideHeaderReturn {
  headerRef: React.RefObject<HTMLDivElement>;
  isHeaderVisible: boolean;
}

export function useScrollHideHeader(): UseScrollHideHeaderReturn {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const headerRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const scrollDelta = useRef(0);

  useEffect(() => {
    const scrollContainer = document.querySelector(".mobile-scroll-container");
    if (!scrollContainer) return;

    const handleScroll = () => {
      const currentScrollY = scrollContainer.scrollTop;
      const diff = currentScrollY - lastScrollY.current;
      lastScrollY.current = currentScrollY;

      const headerHeight = headerRef.current?.offsetHeight ?? 0;
      if (currentScrollY < headerHeight) {
        setIsHeaderVisible(true);
        scrollDelta.current = 0;
        return;
      }

      if (diff > 0) {
        scrollDelta.current = Math.max(0, scrollDelta.current) + diff;
        if (scrollDelta.current > HIDE_THRESHOLD) {
          setIsHeaderVisible(false);
          scrollDelta.current = 0;
        }
      } else {
        scrollDelta.current = Math.min(0, scrollDelta.current) + diff;
        if (scrollDelta.current < -SHOW_THRESHOLD) {
          setIsHeaderVisible(true);
          scrollDelta.current = 0;
        }
      }
    };

    const handleTouch = () => {
      setIsHeaderVisible(true);
      scrollDelta.current = 0;
    };

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    scrollContainer.addEventListener("touchstart", handleTouch, { passive: true });

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
      scrollContainer.removeEventListener("touchstart", handleTouch);
    };
  }, []);

  return { headerRef, isHeaderVisible };
}
