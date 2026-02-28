import { CalendarDays, ChevronRight, Clock3, MapPin } from "lucide-react";

import type { ReservationDetailDto } from "@/types/companion-reservation";

import { formatDateTimeLabel } from "@/lib/shared/format";

import { SHOOTING_DURATION_LABELS } from "@/constants/companion-reservation";

import ProfileAvatar from "./ProfileAvatar";

interface DetailInfoSectionProps {
  detail: ReservationDetailDto;
  ownerMeta: string;
  photoStyleLabels: string[];
}

export default function DetailInfoSection({
  detail,
  ownerMeta,
  photoStyleLabels,
}: DetailInfoSectionProps) {
  const schedule = formatDateTimeLabel(detail.scheduledAt);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2 px-5">
        <h2 className="text-body-1 font-medium text-gray-900">동행일정</h2>
        <div className="rounded-xl bg-gray-50 p-3">
          <div className="mb-2 flex items-center gap-3 text-label-1 text-gray-600">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-4" />
              {schedule.dateLabel}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 className="size-4" />
              {schedule.timeLabel}
            </span>
          </div>
          <div className="inline-flex items-center gap-1 text-label-1 text-gray-600">
            <MapPin className="size-4" />
            {detail.specificPlace}
          </div>
        </div>
      </section>

      {detail.requestMessage ? (
        <section className="flex flex-col gap-2 px-5">
          <h2 className="text-body-1 font-medium text-gray-900">요청메시지</h2>
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-label-1 text-gray-600 whitespace-pre-wrap">
              {detail.requestMessage}
            </p>
          </div>
        </section>
      ) : null}

      <section className="flex flex-col gap-2 px-5">
        <h2 className="text-body-1 font-medium text-gray-900">예상 촬영 시간</h2>
        <div className="inline-flex w-fit rounded-lg bg-gray-50 px-2.5 py-1.5 text-caption text-gray-600">
          {SHOOTING_DURATION_LABELS[detail.shootingDuration] ?? detail.shootingDuration}
        </div>
      </section>

      {photoStyleLabels.length > 0 ? (
        <section className="flex flex-col gap-2 px-5">
          <h2 className="text-body-1 font-medium text-gray-900">원하는 촬영 스타일</h2>
          <div className="flex flex-wrap gap-2">
            {photoStyleLabels.map((style) => (
              <span
                key={style}
                className="inline-flex rounded-lg bg-gray-50 px-2.5 py-1.5 text-caption text-gray-600"
              >
                {style}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <section className="flex flex-col gap-2 px-5">
        <h2 className="text-body-1 font-medium text-gray-900">글쓴이</h2>
        <div className="rounded-xl bg-gray-50 p-3">
          <div className="mb-2 flex items-center gap-2">
            <ProfileAvatar imageUrl={detail.ownerProfileImageUrl} nickname={detail.ownerNickname} />
            <div className="flex flex-1 items-center justify-between">
              <div className="flex flex-col">
                <span className="text-label-1 font-bold text-gray-900">{detail.ownerNickname}</span>
                {ownerMeta ? <span className="text-label-1 text-gray-500">{ownerMeta}</span> : null}
              </div>
              <ChevronRight className="size-5 text-gray-700" />
            </div>
          </div>
          <p className="text-label-1 text-gray-600">
            {detail.ownerIntroduction ? detail.ownerIntroduction : `지역: ${detail.region1Depth}`}
          </p>
        </div>
      </section>
    </div>
  );
}
