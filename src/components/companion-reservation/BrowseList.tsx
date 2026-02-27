import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import type { ReservationSummaryDto } from "@/types/companion-reservation";

import { mapFilterToCondition } from "@/lib/companion-reservation/mapFilterToCondition";

import { createBrowseCardViewModel } from "@/services/companion-reservation";

import { useFilterStore } from "@/store/companion-reservation";

import { useInfiniteScroll } from "@/hooks/shared/useInfiniteScroll";

import { useReservations } from "@/queries/companion-reservation";

import { ReservationCard, ReservationCardFooter } from "@/components/companion-reservation/card";
import { Button } from "@/components/shared/button";
import { LoadingIndicator } from "@/components/shared/loading";

export default function BrowseList() {
  const navigate = useNavigate();
  const { values } = useFilterStore();
  const condition = mapFilterToCondition(values);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useReservations({ limit: 10, condition });

  const reservations = useMemo(() => data?.pages.flatMap((page) => page.content) ?? [], [data]);

  const { loadMoreRef } = useInfiniteScroll({
    onLoadMore: fetchNextPage,
    hasNextPage: hasNextPage ?? false,
    isFetching: isFetchingNextPage,
    isError,
  });

  if (isLoading) {
    return (
      <div className="p-4">
        <LoadingIndicator />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col grow items-center mt-[10dvh] gap-4 px-4 py-8 text-center">
        <p className="text-body-1 font-medium text-gray-700">동행 예약 목록을 불러오지 못했어요.</p>
        <Button.Secondary onClick={() => refetch()} fullWidth className="max-w-64">
          다시 시도
        </Button.Secondary>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="flex flex-col grow items-center mt-[10dvh] gap-2 px-4 py-8 text-center text-gray-700">
        <p className="text-body-1 font-semibold">아직 등록된 동행 예약이 없어요.</p>
        <p className="text-body-2 text-gray-500">새로운 예약이 올라오면 여기에 표시됩니다.</p>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-4 p-4 grow">
      {reservations.map((reservation: ReservationSummaryDto) => {
        const viewModel = createBrowseCardViewModel(reservation);
        const {
          requesterInfo,
          ctaLabel: _cta,
          ctaDisabled: _dis,
          ctaVariant: _var,
          ...cardProps
        } = viewModel;

        const footer = requesterInfo ? (
          <ReservationCardFooter.RequesterInfo
            avatarUrl={requesterInfo.avatarUrl}
            description={requesterInfo.description}
          />
        ) : null;

        return (
          <ReservationCard
            key={reservation.reservationId}
            {...cardProps}
            footer={footer}
            onClick={() => navigate(`/companion/${reservation.reservationId}`)}
          />
        );
      })}

      {hasNextPage ? (
        <div ref={loadMoreRef} className="pb-4">
          {isFetchingNextPage ? <LoadingIndicator /> : null}
        </div>
      ) : null}
    </section>
  );
}
