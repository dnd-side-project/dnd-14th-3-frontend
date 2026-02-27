import { Link } from "react-router-dom";

import { Calendar, ChevronRight } from "lucide-react";

import { COMPANION_SCHEDULE_ITEM } from "@/constants/my-page";

export default function MyPageCompanionSchedule() {
  const { label, description, to } = COMPANION_SCHEDULE_ITEM;

  return (
    <Link
      to={to}
      className="flex items-center gap-3 border-b border-gray-100 px-5 py-4.5 active:bg-gray-50"
    >
      <Calendar className="size-6 shrink-0 text-gray-700" strokeWidth={1.5} />
      <div className="min-w-0 flex-1">
        <p className="text-body-1 font-semibold text-gray-900">{label}</p>
        {description && (
          <p className="mt-0.5 text-label-1 text-gray-500">{description}</p>
        )}
      </div>
      <ChevronRight className="size-6 shrink-0 text-gray-400" strokeWidth={1.9} />
    </Link>
  );
}
