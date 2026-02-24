import { useEffect, useRef } from "react";

interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  hasNextPage: boolean;
  isFetching: boolean;
  isError: boolean;
  rootMargin?: string;
}

export function useInfiniteScroll({
  onLoadMore,
  hasNextPage,
  isFetching,
  isError,
  rootMargin = "120px 0px",
}: UseInfiniteScrollOptions) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasNextPage || isFetching || isError) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onLoadMore();
        }
      },
      { rootMargin },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [onLoadMore, hasNextPage, isFetching, isError, rootMargin]);

  return { loadMoreRef };
}
