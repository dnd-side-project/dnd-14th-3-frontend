import type { CompanionRecordType, CompanionScheduleTab } from "@/types/my-page";

/** 동행 일정 메인 탭 */
export const COMPANION_SCHEDULE_TABS: { id: CompanionScheduleTab; label: string }[] = [
  { id: "scheduled", label: "동행 예정" },
  { id: "completed", label: "동행 완료" },
  { id: "cancelled", label: "취소 일정" },
];

/** 동행 완료 서브탭 (즉흥 / 예약) */
export const COMPANION_RECORD_TYPE_TABS: { id: CompanionRecordType; label: string }[] = [
  { id: "impromptu", label: "즉흥 동행" },
  { id: "reserved", label: "예약 동행" },
];
