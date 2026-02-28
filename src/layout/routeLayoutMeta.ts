import { matchPath } from "react-router-dom";

import type { HeaderLeftAction } from "@/types/layout/page-layout.type";

type RouteLayoutWithHeader = {
  pattern: string;
  showHeader: true;
  showBottomNav: boolean;
  title?: string;
  leftAction?: HeaderLeftAction;
  showRightActions?: boolean;
};

type RouteLayoutWithoutHeader = {
  pattern: string;
  showHeader: false;
  showBottomNav: boolean;
  title?: never;
  leftAction?: never;
  showRightActions?: never;
};

export type RouteLayoutMeta = RouteLayoutWithHeader | RouteLayoutWithoutHeader;

const routeLayoutMeta: RouteLayoutMeta[] = [
  { pattern: "/login", showHeader: false, showBottomNav: false },
  { pattern: "/auth/kakao/callback", showHeader: false, showBottomNav: false },
  { pattern: "/onboarding", showHeader: false, showBottomNav: false },
  { pattern: "/", showHeader: true, showBottomNav: true },
  {
    pattern: "/review",
    showHeader: true,
    showBottomNav: false,
    leftAction: "close",
    showRightActions: false,
  },
  { pattern: "/companion", title: "동행 예약", showHeader: true, showBottomNav: true },
  {
    pattern: "/companion/create",
    title: "예약 생성",
    showHeader: true,
    showBottomNav: false,
    leftAction: "back",
  },
  {
    pattern: "/companion/:reservationId",
    title: "예약 상세",
    showHeader: true,
    showBottomNav: false,
    leftAction: "back",
  },
  { pattern: "/mypage", title: "마이페이지", showHeader: true, showBottomNav: true },
  {
    pattern: "/mypage/profile",
    title: "프로필 카드",
    showHeader: true,
    showBottomNav: false,
    leftAction: "back",
  },
  {
    pattern: "/mypage/profile/edit",
    title: "프로필 수정",
    showHeader: true,
    showBottomNav: false,
    leftAction: "back",
  },
  {
    pattern: "/mypage/account",
    title: "계정 관리",
    showHeader: true,
    showBottomNav: false,
    leftAction: "back",
  },
  {
    pattern: "/mypage/settings",
    title: "설정",
    showHeader: true,
    showBottomNav: false,
    leftAction: "back",
  },
  {
    pattern: "/mypage/companion-schedule/:scheduleId",
    title: "동행 일정 상세",
    showHeader: true,
    showBottomNav: false,
    leftAction: "back",
  },
  {
    pattern: "/mypage/companion-schedule",
    title: "동행 일정",
    showHeader: true,
    showBottomNav: false,
    leftAction: "back",
  },
];

const defaultRouteLayoutMeta: RouteLayoutMeta = {
  pattern: "*",
  showHeader: false,
  showBottomNav: false,
};

export function getRouteLayoutMeta(pathname: string) {
  const matchedMeta = routeLayoutMeta.find(({ pattern }) =>
    Boolean(matchPath({ path: pattern, end: true }, pathname))
  );

  return matchedMeta ?? defaultRouteLayoutMeta;
}

