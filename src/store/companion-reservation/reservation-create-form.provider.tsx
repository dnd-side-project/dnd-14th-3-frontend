import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";

import {
  defaultReservationFormValues,
  reservationFormSchema,
  type ReservationFormValues,
} from "@/types/companion-reservation";

interface ReservationFormStoreProviderProps {
  children: ReactNode;
}

/**
 * 예약 작성 폼 FormContext Provider.
 * 폼 값(title, location, scheduledAt 등)은 FormContext로 관리됩니다.
 * 6단계 스텝은 ReservationCreateStepStoreProvider로 별도 관리합니다.
 */
export function ReservationFormStoreProvider({ children }: ReservationFormStoreProviderProps) {
  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationFormSchema),
    defaultValues: defaultReservationFormValues,
  });

  return <FormProvider {...form}>{children}</FormProvider>;
}
