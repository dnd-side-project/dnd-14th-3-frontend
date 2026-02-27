import type { MyPageMenuItem } from "@/types/my-page";

/** 계정 관리 / 설정 메뉴 */
export const MY_PAGE_MENU_ITEMS: MyPageMenuItem[] = [
  { id: "account", label: "계정 관리", to: "/mypage/account" },
  { id: "settings", label: "설정", to: "/mypage/settings" },
];
