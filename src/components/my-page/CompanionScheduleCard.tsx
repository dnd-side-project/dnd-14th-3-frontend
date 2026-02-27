import { Link } from "react-router-dom";

import { ChevronRight } from "lucide-react";

import type { CompanionScheduleItem } from "@/types/my-page";

interface CompanionScheduleCardProps {
  item: CompanionScheduleItem;
  basePath?: string;
}

function formatDate(dateStr: string) {
  const [, m, d] = dateStr.split("-");
  return `${m}월 ${d}일`;
}

const CardContent = ({
  item,
  badge,
  showChevron,
}: {
  item: CompanionScheduleItem;
  badge: React.ReactNode;
  showChevron: boolean;
}) => {
  const { date, time, place, title } = item;
  return (
    <>
      <div className="min-w-0 flex-1">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="text-label-1 text-gray-500">{formatDate(date)}</span>
          {badge}
        </div>
        <p className="text-body-1 font-semibold text-gray-900">{title ?? place}</p>
        <p className="mt-1 text-label-1 text-gray-500">{time} · {place}</p>
      </div>
      {showChevron && (
        <ChevronRight className="size-5 shrink-0 text-gray-400" strokeWidth={1.9} />
      )}
    </>
  );
};

export default function CompanionScheduleCard({
  item,
  basePath = "/mypage/companion-schedule",
}: CompanionScheduleCardProps) {
  const { id, status } = item;
  const to = `${basePath}/${id}`;
  const isCancelled = status === "cancelled";

  const badge =
    status === "scheduled" ? (
      <span className="inline-flex shrink-0 rounded-full bg-mint-100 px-2 py-0.5 text-label-2 font-medium text-black">
        예약 확정
      </span>
    ) : status === "completed" ? (
      <span className="inline-flex shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-label-2 font-medium text-gray-700">
        동행 완료
      </span>
    ) : (
      <span className="inline-flex shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-label-2 font-medium text-gray-500">
        취소됨
      </span>
    );

  const content = (
    <CardContent item={item} badge={badge} showChevron={!isCancelled} />
  );

  if (isCancelled) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white px-4 py-4">
        {content}
      </div>
    );
  }

  return (
    <Link
      to={to}
      className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white px-4 py-4 active:bg-gray-50"
    >
      {content}
    </Link>
  );
}
