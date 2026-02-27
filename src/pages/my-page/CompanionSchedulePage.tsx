import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import type { ReservationStatus } from "@/types/companion-reservation";

import { ReservationCard, ReservationCardFooter } from "@/components/companion-reservation/card";
import { Calendar } from "@/components/shared/calendar";

type ScheduleTab = "scheduled" | "completed" | "cancelled";
type CompletedType = "impromptu" | "reserved";

type DummyScheduleCard = {
  id: string;
  status: ReservationStatus;
  labelText: string;
  title: string;
  dateLabel: string;
  timeLabel: string;
  locationLabel: string;
  tags?: string[];
};

const MAIN_TABS: { id: ScheduleTab; label: string }[] = [
  { id: "scheduled", label: "동행 예정" },
  { id: "completed", label: "동행 완료" },
  { id: "cancelled", label: "취소 일정" },
];

const COMPLETED_TABS: { id: CompletedType; label: string }[] = [
  { id: "impromptu", label: "즉흥 동행" },
  { id: "reserved", label: "예약 동행" },
];

const DUMMY_COMPLETED_IMPROMPTU: DummyScheduleCard[] = [
  {
    id: "completed-impromptu-1",
    status: "confirmed",
    labelText: "완료",
    title: "고척 스카이돔 인증샷",
    dateLabel: "2025년 12월 11일",
    timeLabel: "18:00",
    locationLabel: "서울 구로구 경인로 430",
    tags: ["전신샷", "30분"],
  },
  {
    id: "completed-impromptu-2",
    status: "confirmed",
    labelText: "완료",
    title: "성수 카페 스냅",
    dateLabel: "2026년 2월 5일",
    timeLabel: "14:00",
    locationLabel: "강남역 9번 출구",
    tags: ["전신샷", "20분"],
  },
];

const DUMMY_COMPLETED_RESERVED: DummyScheduleCard[] = [
  {
    id: "completed-reserved-1",
    status: "closed",
    labelText: "동행 완료",
    title: "고척 스카이돔 인증샷",
    dateLabel: "2025년 12월 11일",
    timeLabel: "18:00",
    locationLabel: "서울 구로구 경인로 430",
    tags: ["전신샷", "30분"],
  },
  {
    id: "completed-reserved-2",
    status: "closed",
    labelText: "동행 완료",
    title: "강남역 느좋 카페 촬영",
    dateLabel: "2026년 2월 5일",
    timeLabel: "14:00",
    locationLabel: "강남역 9번 출구",
    tags: ["전신샷", "20분"],
  },
];

const DUMMY_CANCELLED: DummyScheduleCard[] = [
  {
    id: "cancelled-1",
    status: "closed",
    labelText: "취소",
    title: "고척 스카이돔 인증샷",
    dateLabel: "2025년 12월 11일",
    timeLabel: "18:00",
    locationLabel: "서울 구로구 경인로 430",
    tags: ["전신샷", "30분"],
  },
  {
    id: "cancelled-2",
    status: "closed",
    labelText: "취소",
    title: "강남역 느좋 카페 촬영",
    dateLabel: "2026년 2월 5일",
    timeLabel: "14:00",
    locationLabel: "강남역 9번 출구",
    tags: ["전신샷", "20분"],
  },
];

export default function CompanionSchedulePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get("tab") as ScheduleTab) ?? "scheduled";
  const completedType = (searchParams.get("type") as CompletedType) ?? "impromptu";
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const setTab = (nextTab: ScheduleTab) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", nextTab);
    if (nextTab !== "completed") {
      next.delete("type");
    } else if (!next.get("type")) {
      next.set("type", "impromptu");
    }
    setSearchParams(next, { replace: true });
  };

  const setCompletedType = (nextType: CompletedType) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", "completed");
    next.set("type", nextType);
    setSearchParams(next, { replace: true });
  };

  const completedItems =
    completedType === "impromptu" ? DUMMY_COMPLETED_IMPROMPTU : DUMMY_COMPLETED_RESERVED;

  return (
    <div className="flex flex-col bg-gray-50 h-full">
      <div className="flex gap-1 border-b border-gray-100 bg-white px-5 py-2">
        {MAIN_TABS.map((mainTab) => {
          const isActive = tab === mainTab.id;
          return (
            <button
              key={mainTab.id}
              type="button"
              onClick={() => setTab(mainTab.id)}
              className={`rounded-4xl border px-3 py-2 text-label-1 ${
                isActive
                  ? "border-transparent bg-mint-500 font-bold text-white"
                  : "border-gray-200 bg-white text-gray-600"
              }`}
            >
              {mainTab.label}
            </button>
          );
        })}
      </div>

      {tab === "completed" && (
        <div className="flex w-full bg-white">
          {COMPLETED_TABS.map((subTab) => {
            const isActive = completedType === subTab.id;
            return (
              <button
                key={subTab.id}
                type="button"
                onClick={() => setCompletedType(subTab.id)}
                className={`h-14 flex-1 border-b-2 text-body-1 ${
                  isActive
                    ? "border-mint-500 font-bold text-gray-900"
                    : "border-gray-200 font-medium text-gray-600"
                }`}
              >
                {subTab.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-5 px-5 pb-8 pt-5">
        {tab === "scheduled" && (
          <section className="rounded-xl h-full border border-gray-100 bg-white p-2">
            <Calendar selectedDate={selectedDate} onChange={setSelectedDate} />
          </section>
        )}

        {tab === "completed" &&
          completedItems.map((item) => (
            <ReservationCard
              key={item.id}
              {...item}
              footer={<ReservationCardFooter.CTA label="상세 보기" status="confirmed" />}
            />
          ))}

        {tab === "cancelled" &&
          DUMMY_CANCELLED.map((item) => (
            <ReservationCard key={item.id} {...item} />
          ))}
      </div>
    </div>
  );
}
