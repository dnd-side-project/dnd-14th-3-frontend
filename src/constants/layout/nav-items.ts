import { Camera, CircleUserRound, Flag } from "lucide-react";

import type { LayoutNavItem } from "@/types/layout/nav-item.type";

export const layoutNavItems: LayoutNavItem[] = [
  {
    to: "/",
    label: "지도",
    icon: Flag,
  },
  {
    to: "/companion",
    label: "동행 예약",
    icon: Camera,
  },
  {
    to: "/mypage",
    label: "마이페이지",
    icon: CircleUserRound,
  },
];
