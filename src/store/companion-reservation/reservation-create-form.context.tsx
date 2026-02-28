import { useFormContext, UseFormReturn } from "react-hook-form";

import { ReservationFormValues } from "@/types/companion-reservation";

export function useReservationFormContext(): UseFormReturn<ReservationFormValues> {
  const context = useFormContext<ReservationFormValues>();

  if (!context) {
    throw new Error("useReservationFormContext must be used within ReservationFormProvider");
  }

  return context;
}
