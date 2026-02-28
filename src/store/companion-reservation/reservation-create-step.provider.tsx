import { useState } from "react";

import type { ReactNode } from "react";

import { ReservationCreateStepStoreContext } from "./reservation-create-step.context";
import { createReservationCreateStepStore } from "./reservation-create-step.store";

interface ReservationCreateStepStoreProviderProps {
  children: ReactNode;
}

/**
 * 예약 작성 6단계 스텝을 지역(Provider 하위)에서 관리합니다.
 * CreateBottomSheet를 감싸서 사용하면, 바텀시트마다 독립적인 스텝 상태를 가집니다.
 */
export function ReservationCreateStepStoreProvider({
  children,
}: ReservationCreateStepStoreProviderProps) {
  const [store] = useState(() => createReservationCreateStepStore());

  return (
    <ReservationCreateStepStoreContext.Provider value={store}>
      {children}
    </ReservationCreateStepStoreContext.Provider>
  );
}
