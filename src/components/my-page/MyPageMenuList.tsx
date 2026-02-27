import { Link } from "react-router-dom";

import { ChevronRight } from "lucide-react";

import { MY_PAGE_MENU_ITEMS } from "@/constants/my-page";

export default function MyPageMenuList() {
  return (
    <div className="border-t border-gray-100">
      {MY_PAGE_MENU_ITEMS.map((item) => (
        <Link
          key={item.id}
          to={item.to}
          className="flex items-center gap-3 border-b border-gray-100 px-5 py-4 active:bg-gray-50"
        >
          <span className="flex-1 text-body-1 font-medium text-gray-900">
            {item.label}
          </span>
          <ChevronRight className="size-5 shrink-0 text-gray-400" strokeWidth={1.9} />
        </Link>
      ))}
    </div>
  );
}
