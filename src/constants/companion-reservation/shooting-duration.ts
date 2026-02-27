import type { ShootingDuration } from "@/types/companion-reservation";

export const SHOOTING_DURATION_LABELS: Record<ShootingDuration, string> = {
  TEN_MINUTES: "10분 예상",
  TWENTY_MINUTES: "20분 예상",
  THIRTY_PLUS_MINUTES: "30분+",
  ONE_HOUR: "1시간 이상",
};
