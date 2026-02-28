export interface DateTimeLabel {
  dateLabel: string;
  timeLabel: string;
}

const KST_TIMEZONE = "Asia/Seoul";

/**
 * ISO 8601 문자열(UTC)을 한국어 날짜/시간 라벨(KST, UTC+9)로 포맷팅
 *
 * @param isoString - ISO 8601 형식의 날짜/시간 문자열 (UTC)
 * @returns 날짜 라벨(예: "2026년 2월 5일")과 시간 라벨(예: "23:00")
 *
 * @example
 * ```ts
 * const { dateLabel, timeLabel } = formatDateTimeLabel("2026-02-05T14:00:00Z");
 * // dateLabel: "2026년 2월 5일"
 * // timeLabel: "23:00" (UTC 14:00 + 9h = KST 23:00)
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
    timeZone: KST_TIMEZONE,
  });
  const timeLabel = date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: KST_TIMEZONE,
  });

  return { dateLabel, timeLabel };
}
