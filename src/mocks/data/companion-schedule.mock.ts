import type { CompanionScheduleItem } from "@/types/my-page";

/** 동행 일정 목업 데이터 */
export const MOCK_SCHEDULED_ITEMS: CompanionScheduleItem[] = [
  {
    id: "s1",
    status: "scheduled",
    date: "2025-03-01",
    time: "14:00",
    place: "서울시 강남구 테헤란로 123",
    title: "봄 사진 촬영",
  },
  {
    id: "s2",
    status: "scheduled",
    date: "2025-03-05",
    time: "10:00",
    place: "경복궁",
    title: "한복 촬영",
  },
];

export const MOCK_COMPLETED_ITEMS: CompanionScheduleItem[] = [
  {
    id: "c1",
    status: "completed",
    type: "impromptu",
    date: "2025-02-20",
    time: "15:00",
    place: "인사동",
    title: "즉흥 인사동 산책",
    hasReview: true,
  },
  {
    id: "c2",
    status: "completed",
    type: "reserved",
    date: "2025-02-18",
    time: "11:00",
    place: "남산타워",
    title: "예약 남산 촬영",
    hasReview: false,
  },
];

export const MOCK_CANCELLED_ITEMS: CompanionScheduleItem[] = [
  {
    id: "x1",
    status: "cancelled",
    date: "2025-02-15",
    time: "09:00",
    place: "올림픽공원",
    title: "취소된 일정",
  },
];
