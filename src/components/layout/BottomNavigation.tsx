import { NavLink } from "react-router-dom";

import { Camera, CircleUserRound, Flag } from "lucide-react";

import { usePageLayoutStore } from "@/store/layout/pageLayout.store";

const navItems = [
  {
    to: "/",
    label: "지도",
    icon: <Flag className="h-6 w-6" strokeWidth={1.8} />,
  },
  {
    to: "/companion",
    label: "동행 예약",
    icon: <Camera className="h-6 w-6" strokeWidth={1.8} />,
  },
  {
    to: "/mypage",
    label: "마이페이지",
    icon: <CircleUserRound className="h-6 w-6" strokeWidth={1.8} />,
  },
];

export default function BottomNavigation() {
  const showBottomNav = usePageLayoutStore((state) => state.layout.showBottomNav);

  if (!showBottomNav) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 z-10 w-full max-w-[600px] border-t border-gray-200 bg-white px-2 pb-safe">
      <ul className="grid h-16 grid-cols-3">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `flex h-full flex-col items-center justify-center gap-1 text-caption-2 font-bold ${
                  isActive ? "text-mint-600" : "text-gray-500"
                }`
              }
              end={item.to === "/"}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
