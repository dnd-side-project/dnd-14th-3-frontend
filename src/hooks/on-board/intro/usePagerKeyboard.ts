import { useEffect } from "react";

export function usePagerKeyboard(
  goTo: (nextIndex: number) => void,
  index: number,
  totalSlides: number
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goTo(index - 1);
        e.preventDefault();
      } else if (e.key === "ArrowRight") {
        goTo(index + 1);
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goTo, index, totalSlides]);
}