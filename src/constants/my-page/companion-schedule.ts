import type { MyPageMenuItem } from "@/types/my-page";

/** 동행 일정 보기 메뉴 */
export const COMPANION_SCHEDULE_ITEM: MyPageMenuItem = {
  id: "companion-schedule",
  label: "동행 일정 보기",
  description: "다가오는 동행 일정을 관리해요",
  to: "/mypage/companion-schedule",
};
