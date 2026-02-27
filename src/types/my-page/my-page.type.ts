/** 마이페이지 요약 정보 */
export interface MyPageSummary {
  nickname: string;
  profileImageUrl?: string;
  rating: number;
  companionCount: number;
  /** 프로필 카드용 추가 필드 (선택) */
  gender?: string;
  ageRange?: string;
  introduction?: string;
  shootingStyleLabels?: string[];
}

/** 마이페이지 메뉴 아이템 */
export interface MyPageMenuItem {
  id: string;
  label: string;
  description?: string;
  to: string;
}

/** 동행 일정 탭 */
export type CompanionScheduleTab = "scheduled" | "completed" | "cancelled";

/** 동행 완료 타입 (즉흥 / 예약) */
export type CompanionRecordType = "impromptu" | "reserved";

/** 동행 일정 상태 */
export type CompanionScheduleStatus = "scheduled" | "completed" | "cancelled";

/** 동행 일정 카드 */
export interface CompanionScheduleItem {
  id: string;
  status: CompanionScheduleStatus;
  type?: CompanionRecordType;
  date: string;
  time: string;
  place: string;
  title?: string;
  description?: string;
  /** 동행 완료 시 후기 여부 */
  hasReview?: boolean;
}
