import { Link, useNavigate } from "react-router-dom";

import { CircleUserRound, Heart, Pencil } from "lucide-react";

import type { MyPageSummary } from "@/types/my-page";

interface ProfileCardSummaryProps {
  summary: MyPageSummary;
}

/** 마이페이지 메인에 표시되는 프로필 카드 요약 (Figma 806:13388) */
export default function ProfileCardSummary({ summary }: ProfileCardSummaryProps) {
  const navigate = useNavigate();
  const { nickname, profileImageUrl, rating, companionCount } = summary;

  const handleClick = () => {
    navigate("/mypage/profile");
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className="mx-4 mt-4 flex w-[calc(100%-2rem)] cursor-pointer flex-col items-center overflow-hidden rounded-2xl border border-gray-100 bg-white px-6 py-6 text-left active:bg-gray-50"
    >
      <div className="relative">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200">
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt={`${nickname} 프로필`}
              className="size-full object-cover"
            />
          ) : (
            <CircleUserRound className="size-10 text-gray-500" strokeWidth={1.5} />
          )}
        </div>
        <Link
          to="/mypage/profile/edit"
          onClick={(e) => e.stopPropagation()}
          className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full border-2 border-white bg-gray-900 text-white"
          aria-label="프로필 편집"
        >
          <Pencil className="size-3.5" strokeWidth={2} />
        </Link>
      </div>
      <h2 className="mt-3 text-heading-2 font-bold text-gray-900">{nickname}</h2>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-mint-100 px-2.5 py-1 text-label-1 font-medium text-black">
          <Heart className="size-3.5 fill-current" strokeWidth={1.5} />
          {rating}점
        </span>
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-label-1 text-gray-700">
          프로필 공개
        </span>
      </div>
      <div className="mt-4 flex flex-col gap-0.5 text-center">
        <p className="text-label-1 text-gray-500">이번 달 동행</p>
        <p className="text-title-2 font-bold text-gray-900">총 {companionCount}회</p>
      </div>
    </div>
  );
}
