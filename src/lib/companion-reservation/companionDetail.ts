import { FALLBACK_PHOTO_STYLES } from "@/constants/user";

const GENDER_LABEL: Record<string, string> = {
  MALE: "남성",
  FEMALE: "여성",
};

const AGE_GROUP_LABEL: Record<string, string> = {
  TEENS: "10대",
  TWENTIES: "20대",
  THIRTIES: "30대",
  FORTIES: "40대",
  FIFTIES_AND_ABOVE: "50대 이상",
};

const PHOTO_STYLE_LABELS = new Map(FALLBACK_PHOTO_STYLES.map((style) => [style.id, style.label]));

export function getStatusMessage(status: string) {
  if (status === "CONFIRMED") return "동행이 확정되었어요.";
  if (status === "RECRUITMENT_CLOSED") return "모집이 마감되었어요.";
  if (status === "COMPLETED") return "완료된 동행이에요.";
  return "취소된 동행이에요.";
}

export function getOwnerMeta(ownerAgeGroup?: string, ownerGender?: string): string {
  return [
    ownerAgeGroup ? (AGE_GROUP_LABEL[ownerAgeGroup] ?? ownerAgeGroup) : null,
    ownerGender ? (GENDER_LABEL[ownerGender] ?? ownerGender) : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function getPhotoStyleLabels(photoStyleSnapshot?: string[]): string[] {
  return (photoStyleSnapshot ?? []).map((style) => PHOTO_STYLE_LABELS.get(style) ?? style);
}
