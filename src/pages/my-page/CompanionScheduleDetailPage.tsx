import { Link, useNavigate, useParams } from "react-router-dom";

import type { ReservationStatus } from "@/types/companion-reservation";

import { ReservationCard } from "@/components/companion-reservation/card";
import { Button } from "@/components/shared/button";

type DummyScheduleDetail = {
  id: string;
  status: ReservationStatus;
  labelText: string;
  title: string;
  dateLabel: string;
  timeLabel: string;
  locationLabel: string;
  tags?: string[];
  memo?: string;
};

const ALL_ITEMS: DummyScheduleDetail[] = [
  {
    id: "scheduled-1",
    status: "confirmed",
    labelText: "동행 예정",
    title: "한강 공원 인생샷 촬영",
    dateLabel: "2026-03-12",
    timeLabel: "14:00",
    locationLabel: "서울 한강공원",
    tags: ["야외 자연광", "SNS 업로드용"],
    memo: "여유 있게 13:45까지 도착해주세요.",
  },
  {
    id: "completed-1",
    status: "closed",
    labelText: "동행 완료",
    title: "북촌 한옥마을 스냅",
    dateLabel: "2026-02-25",
    timeLabel: "16:00",
    locationLabel: "서울 북촌 한옥마을",
    tags: ["전신"],
    memo: "촬영 완료. 추후 원본 전달 예정.",
  },
  {
    id: "cancelled-1",
    status: "closed",
    labelText: "취소됨",
    title: "여의도 벚꽃 촬영",
    dateLabel: "2026-02-21",
    timeLabel: "10:00",
    locationLabel: "서울 여의도공원",
    memo: "기상 악화로 취소되었습니다.",
  },
];

export default function CompanionScheduleDetailPage() {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const navigate = useNavigate();

  const item = ALL_ITEMS.find((i) => i.id === scheduleId);

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-12">
        <p className="text-body-1 text-gray-500">일정을 찾을 수 없어요</p>
        <Link to="/mypage/companion-schedule">
          <Button.Secondary>목록으로</Button.Secondary>
        </Link>
      </div>
    );
  }

  const { memo, ...cardProps } = item;

  return (
    <div className="flex flex-col gap-6 px-4 pb-8 pt-2">
      <ReservationCard {...cardProps} />

      <section className="rounded-xl border border-gray-100 bg-white px-4 py-6">
        <h3 className="mb-3 text-body-1 font-semibold text-gray-900">안내 메모</h3>
        <p className="text-body-2 text-gray-600">{memo ?? "별도 메모가 없습니다."}</p>
      </section>

      <div className="mt-auto">
        <Button.Secondary fullWidth onClick={() => navigate("/mypage/companion-schedule")}>
          목록으로 돌아가기
        </Button.Secondary>
      </div>
    </div>
  );
}
