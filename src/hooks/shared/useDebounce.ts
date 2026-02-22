import { useEffect, useMemo, useState } from "react";

import { debounce } from "@/lib/shared/debounce";

/**
 * 값을 delay(ms)만큼 지연해 반환합니다.
 * value가 바뀐 뒤 delay 동안 더 이상 변경이 없을 때만 반환값이 갱신됩니다.
 * lib의 debounce 순수 함수를 사용합니다.
 *
 * @param value - 디바운스할 값
 * @param delay - 지연 시간(ms)
 * @returns 디바운스된 값
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  const debouncedSet = useMemo(
    () => debounce((v: T) => setDebouncedValue(v), delay),
    [delay]
  );

  useEffect(() => {
    debouncedSet(value);
  }, [value, debouncedSet]);

  return debouncedValue;
}
