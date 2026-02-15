import { matchPath } from "react-router-dom";

export type RouteLayoutMeta = {
  pattern: string;
  title?: string;
  showHeader: boolean;
  showBottomNav: boolean;
};

const routeLayoutMeta: RouteLayoutMeta[] = [
  { pattern: "/login", showHeader: false, showBottomNav: false },
  { pattern: "/auth/kakao/callback", showHeader: false, showBottomNav: false },
  { pattern: "/onboarding", showHeader: false, showBottomNav: false },
  { pattern: "/", title: "메인 지도", showHeader: true, showBottomNav: true },
  { pattern: "/review", title: "촬영 후기", showHeader: false, showBottomNav: false },
  { pattern: "/companion", title: "동행 예약", showHeader: true, showBottomNav: true },
  { pattern: "/companion/create", title: "예약 생성", showHeader: true, showBottomNav: false },
  {
    pattern: "/companion/:reservationId",
    title: "예약 상세",
    showHeader: true,
    showBottomNav: false,
  },
  { pattern: "/mypage", title: "마이페이지", showHeader: true, showBottomNav: true },
];

const defaultRouteLayoutMeta: RouteLayoutMeta = {
  pattern: "*",
  title: "",
  showHeader: false,
  showBottomNav: false,
};

export function getRouteLayoutMeta(pathname: string) {
  const matchedMeta = routeLayoutMeta.find(({ pattern }) =>
    Boolean(matchPath({ path: pattern, end: true }, pathname))
  );

  return matchedMeta ?? defaultRouteLayoutMeta;
}
