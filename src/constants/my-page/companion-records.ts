/** 동행 기록 퀵 링크 (즉흥 / 예약) → 동행 완료 목록 탭으로 이동 */
export const COMPANION_RECORD_ITEMS: { id: string; label: string; to: string }[] = [
  { id: "impromptu", label: "즉흥 동행 기록", to: "/mypage/companion-schedule?tab=completed&type=impromptu" },
  { id: "reserved", label: "예약 동행 기록", to: "/mypage/companion-schedule?tab=completed&type=reserved" },
];
