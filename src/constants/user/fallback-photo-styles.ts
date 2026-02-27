import type { PhotoStyle } from "@/types/profile";

/**
 * API 로드 실패 시 PhotoStyleStep에서 사용하는 폴백 포토 스타일 목록.
 * 서버에서 { id, label }[] 형태로 받아오는 값과 동일한 구조.
 */
export const FALLBACK_PHOTO_STYLES: PhotoStyle[] = [
  { id: "UPPER_BODY_FOCUS", name: "UPPER_BODY_FOCUS", label: "상반신 위주" },
  { id: "FULL_BODY", name: "FULL_BODY", label: "전신" },
  { id: "PROP_USAGE", name: "PROP_USAGE", label: "소품 활용" },
  { id: "INDOOR_SHOOT", name: "INDOOR_SHOOT", label: "실내 촬영" },
  { id: "OUTDOOR_NATURAL_LIGHT", name: "OUTDOOR_NATURAL_LIGHT", label: "야외 자연광" },
  { id: "SNS_UPLOAD", name: "SNS_UPLOAD", label: "SNS 업로드용" },
  { id: "PERSONAL_RECORD", name: "PERSONAL_RECORD", label: "개인 기록용" },
];
