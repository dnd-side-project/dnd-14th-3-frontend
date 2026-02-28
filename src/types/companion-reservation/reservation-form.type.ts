import { z } from "zod";

import { geoPointSchema } from "./reservation.type";

export const reservationFormSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요").max(50),
  region1Depth: z.string().min(1, "지역을 선택해주세요"),
  specificPlace: z.string().min(1, "상세 위치를 입력해주세요").max(150),
  location: geoPointSchema.nullable(),
  scheduledAt: z.string().min(1, "날짜와 시간을 선택해주세요"),
  shootingDuration: z.enum([
    "TEN_MINUTES",
    "TWENTY_MINUTES",
    "THIRTY_PLUS_MINUTES",
    "ONE_HOUR",
  ] as const),
  requestMessage: z.string().min(1, "요청메시지를 입력해주세요").max(200),
});

export type ReservationFormValues = z.infer<typeof reservationFormSchema>;

export const defaultReservationFormValues: ReservationFormValues = {
  title: "",
  region1Depth: "",
  specificPlace: "",
  location: null,
  scheduledAt: "",
  shootingDuration: "TWENTY_MINUTES",
  requestMessage: "",
};
