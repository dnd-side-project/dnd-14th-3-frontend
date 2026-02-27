import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import type { AppliedReservationListDto } from "@/types/companion-reservation";

import { toAppliedCardProps } from "@/services/companion-reservation";

import { useInfiniteScroll } from "@/hooks/shared/useInfiniteScroll";

import { useAppliedReservations } from "@/queries/companion-reservation";

import { ReservationCard, ReservationCardFooter } from "@/components/companion-reservation/card";
import { Button } from "@/components/shared/button";
import { LoadingIndicator } from "@/components/shared/loading";

export default function AppliedList() {
  const navigate = useNavigate();
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useAppliedReservations({ limit: 10 });

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
      <div className="flex flex-col grow items-center mt-[16dvh] gap-4 px-4 py-8 text-center">
        <p className="text-body-1 font-medium text-gray-700">
          신청한 동행 목록을 불러오지 못했어요.
        </p>
        <Button.Secondary onClick={() => refetch()} fullWidth className="max-w-64">
          다시 시도
        </Button.Secondary>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="flex flex-col grow items-center mt-[16dvh] gap-2 px-4 py-8 text-center text-gray-700">
        <p className="text-body-1 font-semibold">아직 신청한 동행이 없어요.</p>
        <p className="text-body-2 text-gray-500">마음에 드는 동행 요청에 지원해보세요.</p>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-4 p-4 grow">
      {reservations.map((reservation: AppliedReservationListDto) => {
        const props = toAppliedCardProps(reservation, reservation.status);
        const { requesterInfo: _req, ctaLabel, ctaVariant, ...cardProps } = props;

        const footer = ctaLabel ? (
          <div onClick={(e) => e.stopPropagation()}>
            <ReservationCardFooter.CTA
              label={ctaLabel}
              status={cardProps.status}
              variant={ctaVariant}
              onClick={() => navigate(`/companion/${reservation.reservationId}`)}
            />
          </div>
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

