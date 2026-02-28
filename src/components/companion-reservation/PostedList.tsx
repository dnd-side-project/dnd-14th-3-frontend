import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import type { CreatedReservationListDto } from "@/types/companion-reservation";

import { toPostedCardProps } from "@/services/companion-reservation";

import { useInfiniteScroll } from "@/hooks/shared/useInfiniteScroll";

import { useMyReservations } from "@/queries/companion-reservation";

import { ReservationCard, ReservationCardFooter } from "@/components/companion-reservation/card";
import { Button } from "@/components/shared/button";
import { LoadingIndicator } from "@/components/shared/loading";

export default function PostedList() {
  const navigate = useNavigate();
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useMyReservations({ limit: 10 });

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
        <p className="text-body-1 font-medium text-gray-700">내 동행 요청을 불러오지 못했어요.</p>
        <Button.Secondary onClick={() => refetch()} fullWidth className="max-w-64">
          다시 시도
        </Button.Secondary>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="flex flex-col grow items-center mt-[16dvh] gap-2 px-4 py-8 text-center text-gray-700">
        <p className="text-body-1 font-semibold">아직 올린 동행 요청이 없어요.</p>
        <p className="text-body-2 text-gray-500">동행 요청을 등록해보세요.</p>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-4 p-4 grow">
      {reservations.map((reservation: CreatedReservationListDto) => {
        const props = toPostedCardProps(reservation, reservation.status);
        const { requesterInfo: _req, ctaLabel, ctaVariant, ...cardProps } = props;

        const footer = ctaLabel ? (
          <div onClick={(e) => e.stopPropagation()}>
            <ReservationCardFooter.CTA
              label={ctaLabel}
              status={cardProps.status}
              variant={ctaVariant}
              onClick={() =>
                cardProps.status === "recruiting"
                  ? navigate(`/companion/${reservation.reservationId}/applicants`)
                  : navigate(`/companion/${reservation.reservationId}`)
              }
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
