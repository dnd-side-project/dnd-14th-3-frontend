import { matchPath } from "react-router-dom";

import type { HeaderLeftAction } from "@/layout/pageLayout.types";

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
  { pattern: "/", title: "메인 지도", showHeader: true, showBottomNav: true },
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
