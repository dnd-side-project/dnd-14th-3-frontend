import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { usePageLayoutStore } from "@/store/layout/pageLayout.store";

import BottomNavigation from "@/components/layout/BottomNavigation";
import Header from "@/components/layout/Header";
import SideDrawer from "@/components/layout/SideDrawer";

import { getRouteLayoutMeta } from "@/layout/routeLayoutMeta";

export default function MobileLayout() {
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const routeLayoutMeta = useMemo(() => getRouteLayoutMeta(location.pathname), [location.pathname]);
  const setLayout = usePageLayoutStore((state) => state.setLayout);
  const showBottomNav = usePageLayoutStore((state) => state.layout.showBottomNav);

  useEffect(() => {
    setLayout(routeLayoutMeta);
  }, [routeLayoutMeta, setLayout]);

  return (
    <div className="flex min-h-dvh w-full justify-center bg-gray-100">
      <div className="relative flex min-h-dvh w-full max-w-[600px] flex-col overflow-hidden bg-white">
        <Header onMenuClick={() => setIsDrawerOpen(true)} />
        <main className={`flex-1 ${showBottomNav ? "pb-[calc(64px+env(safe-area-inset-bottom))]" : ""}`}>
          <Outlet />
        </main>
        <SideDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
        <BottomNavigation />
      </div>
    </div>
  );
}
