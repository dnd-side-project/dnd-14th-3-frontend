import type { ReservationStatus } from "@/types/companion-reservation";

export const RESERVATION_STATUS_STYLES: Record<
  ReservationStatus,
  { labelClass: string; accentColor?: string }
> = {
  recruiting: {
    labelClass: "bg-mint-500 text-white",
    accentColor: "#2FE1D6",
  },
  confirmed: {
    labelClass: "bg-mint-500 text-white",
    accentColor: "#2FE1D6",
  },
  pending: {
    labelClass: "bg-gray-200 text-gray-600",
    accentColor: "#D5D5D5",
  },
  closed: {
    labelClass: "bg-warning-500 text-white",
    accentColor: "#FF6B6B",
  },
};
