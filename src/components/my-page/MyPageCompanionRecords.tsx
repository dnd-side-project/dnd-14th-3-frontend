import { Link } from "react-router-dom";

import { MapPin, Pencil } from "lucide-react";

import { COMPANION_RECORD_ITEMS } from "@/constants/my-page";

const ICON_MAP = {
  impromptu: MapPin,
  reserved: Pencil,
} as const;

export default function MyPageCompanionRecords() {
  return (
    <div className="grid grid-cols-2">
      {COMPANION_RECORD_ITEMS.map((item) => {
        const Icon = ICON_MAP[item.id as keyof typeof ICON_MAP] ?? MapPin;
        return (
          <Link
            key={item.id}
            to={item.to}
            className="flex items-center justify-center gap-2 px-5 py-4 active:bg-gray-50"
          >
            <Icon className="size-5 shrink-0 text-gray-700" strokeWidth={1.5} />
            <span className="text-body-1 font-medium text-gray-900">
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
