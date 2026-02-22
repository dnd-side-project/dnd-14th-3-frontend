/**
 * 함수 호출을 delay(ms)만큼 지연합니다.
 * 연속으로 호출되면 마지막 호출만 delay 후 실행됩니다.
 *
 * @param fn - 디바운스할 함수
 * @param delay - 지연 시간(ms)
 * @returns 디바운스된 함수
 */
export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  delay: number
): (...args: A) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return function (this: unknown, ...args: A) {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
}
