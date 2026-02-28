import { Link } from "react-router-dom";

import { CircleUserRound, Heart, Pencil } from "lucide-react";

import { useGetUserProfile, usePhotoStyles } from "@/queries/user";

const GENDER_LABELS: Record<string, string> = {
  MALE: "남성",
  FEMALE: "여성",
};

const AGE_LABELS: Record<string, string> = {
  TEENS: "10대",
  TWENTIES: "20대",
  THIRTIES: "30대",
  FORTIES: "40대",
  FIFTIES_AND_ABOVE: "50대 이상",
};

export default function ProfileCardPage() {
  const { data: profile, isLoading } = useGetUserProfile();
  const { data: photoStyles } = usePhotoStyles();

  if (isLoading || !profile) {
    return (
      <div className="flex min-h-[300px] items-center justify-center px-4">
        <span className="text-body-2 text-gray-500">로딩 중...</span>
      </div>
    );
  }

  const { nickname, profileImageUrl, gender, ageGroup, introduction, photoStyles: profileStyles } =
    profile;
  const rating = 4.8;
  const companionCount = 12;
  const isProfilePublic = true;

  const photoStyleLabelMap = new Map((photoStyles ?? []).map((style) => [style.name, style.label]));
  const shootingStyleLabels = (profileStyles ?? []).map(
    (styleName) => photoStyleLabelMap.get(styleName) ?? styleName
  );

  const detailSegments = [
    gender ? GENDER_LABELS[gender] ?? gender : null,
    ageGroup ? AGE_LABELS[ageGroup] ?? ageGroup : null,
  ].filter(Boolean);

  return (
    <div className="min-h-full bg-gray-50 px-5 pb-8 pt-4">
      <div className="flex flex-col items-center">
        <div className="flex size-20 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white">
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt={`${nickname} 프로필`}
              className="size-full object-cover"
            />
          ) : (
            <CircleUserRound className="size-10 text-gray-400" strokeWidth={1.5} />
          )}
        </div>
        <div className="mt-4 flex items-center gap-1">
          <h2 className="text-heading-2 font-normal text-gray-900">
            {nickname}
          </h2>
          <Link
            to="/mypage/profile/edit"
            className="inline-flex size-6 items-center justify-center rounded-full bg-mint-500 text-white"
            aria-label="프로필 편집"
          >
            <Pencil className="size-3.5" strokeWidth={2.4} />
          </Link>
        </div>
      </div>

      <div className="mt-7 rounded-2xl border border-gray-50 bg-white px-4 pb-3 pt-4 shadow-[0_2px_8px_0_rgba(0,0,0,0.06)]">
        <span className="inline-flex items-center rounded-lg bg-mint-500 px-2.5 py-1.5 text-[12px] font-bold leading-[1.33] tracking-[0.02em] text-gray-50">
          {isProfilePublic ? "공개" : "비공개"}
        </span>

        <div className="mt-3 flex items-start justify-between gap-3">
          <h3 className="text-heading-2 font-bold text-gray-900">{nickname}</h3>
          <span className="inline-flex items-center gap-1 rounded-lg border border-mint-500 bg-white px-2.5 py-1.5 text-[12px] font-medium leading-[1.33] tracking-[0.02em] text-gray-900">
            <Heart className="size-3.5 fill-mint-500 text-mint-500" strokeWidth={1.5} />
            {rating}점
          </span>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          {detailSegments.length > 0 && (
            <p className="text-label-1 font-medium text-gray-500">
              {detailSegments.join(" | ")}
            </p>
          )}
          {introduction && (
            <p className="text-label-1 font-medium text-gray-500">{introduction}</p>
          )}
        </div>

        {shootingStyleLabels && shootingStyleLabels.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {shootingStyleLabels.map((label) => (
              <span
                key={label}
                className="rounded-lg bg-gray-50 px-2.5 py-1.5 text-[12px] leading-[1.33] tracking-[0.02em] text-gray-500"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 border-t border-gray-50 pt-2.5">
          <p className="text-label-1 text-gray-500">
            이번달 동행 횟수{" "}
            <span className="font-bold text-mint-500">{companionCount}회</span>
          </p>
        </div>
      </div>
    </div>
  );
}
