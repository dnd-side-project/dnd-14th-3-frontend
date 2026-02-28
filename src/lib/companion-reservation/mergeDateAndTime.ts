/**
 * 날짜(Date)와 시간(Time)을 합쳐 하나의 Date로 반환합니다.
 *
 * - dateBase: 연·월·일 정보 (시간은 무시됨)
 * - timeSource: 시·분 정보 (날짜는 무시됨)
 *
 * @example
 * const date = new Date(2025, 2, 15);      // 3월 15일 00:00
 * const time = new Date(0, 0, 0, 14, 30); // 14:30
 * mergeDateAndTime(date, time);             // 2025-03-15 14:30
 */
export function mergeDateAndTime(dateBase: Date, timeSource: Date): Date {
  const merged = new Date(dateBase);
  merged.setHours(
    timeSource.getHours(),
    timeSource.getMinutes(),
    timeSource.getSeconds(),
    timeSource.getMilliseconds()
  );
  return merged;
}
