export interface DateTimeLabel {
  dateLabel: string;
  timeLabel: string;
}

/**
 * ISO 8601 문자열을 한국어 날짜/시간 라벨로 포맷팅
 *
 * @param isoString - ISO 8601 형식의 날짜/시간 문자열
 * @returns 날짜 라벨(예: "2026년 2월 5일")과 시간 라벨(예: "14:00")
 *
 * @example
 * ```ts
 * const { dateLabel, timeLabel } = formatDateTimeLabel("2026-02-05T14:00:00Z");
 * // dateLabel: "2026년 2월 5일"
 * // timeLabel: "14:00"
 * ```
 */
export function formatDateTimeLabel(isoString: string): DateTimeLabel {
  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) {
    return { dateLabel: isoString, timeLabel: "" };
  }

  const dateLabel = date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeLabel = date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return { dateLabel, timeLabel };
}
