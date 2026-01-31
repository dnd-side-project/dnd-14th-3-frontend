import { Outlet } from "react-router-dom";

export default function MobileLayout() {
  return (
    <div className="min-h-dvh w-full bg-gray-100 flex justify-center">
      <div className="w-full max-w-[600px] min-h-dvh bg-white pb-safe">
        <Outlet />
      </div>
    </div>
  );
}
