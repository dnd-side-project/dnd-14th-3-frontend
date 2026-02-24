import type { ShootingStyle } from "@/types/on-board";

export const PHOTO_STYLE_LABEL_MAP: Record<string, string> = {
  UPPER_BODY_FOCUS: "상반신 위주",
  FULL_BODY: "전신",
  PROP_USAGE: "소품 사용",
  INDOOR_SHOOT: "실내 촬영",
  OUTDOOR_NATURAL_LIGHT: "야외 자연광",
  SNS_UPLOAD: "SNS 업로드용",
  PERSONAL_RECORD: "개인 기록용",
};

/**
 * API 로드 실패 또는 빈 응답 시 사용할 촬영 스타일 목록.
 */
export const FALLBACK_SHOOTING_STYLES: ShootingStyle[] = [
  { id: "UPPER_BODY_FOCUS", label: PHOTO_STYLE_LABEL_MAP.UPPER_BODY_FOCUS },
  { id: "FULL_BODY", label: PHOTO_STYLE_LABEL_MAP.FULL_BODY },
  { id: "PROP_USAGE", label: PHOTO_STYLE_LABEL_MAP.PROP_USAGE },
  { id: "INDOOR_SHOOT", label: PHOTO_STYLE_LABEL_MAP.INDOOR_SHOOT },
  { id: "OUTDOOR_NATURAL_LIGHT", label: PHOTO_STYLE_LABEL_MAP.OUTDOOR_NATURAL_LIGHT },
  { id: "SNS_UPLOAD", label: PHOTO_STYLE_LABEL_MAP.SNS_UPLOAD },
  { id: "PERSONAL_RECORD", label: PHOTO_STYLE_LABEL_MAP.PERSONAL_RECORD },
];
