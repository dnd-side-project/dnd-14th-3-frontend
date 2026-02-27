import { useNavigate } from "react-router-dom";

import { CircleUserRound, Heart } from "lucide-react";

import type { MyPageSummary } from "@/types/my-page";

interface MyPageProfileSectionProps {
  summary: MyPageSummary;
}

export default function MyPageProfileSection({ summary }: MyPageProfileSectionProps) {
  const navigate = useNavigate();
  const { nickname, profileImageUrl, rating } = summary;

  const handleClickProfile = () => {
    navigate("/mypage/profile");
  };

  return (
    <section className="flex justify-between items-center gap-3 px-5 py-4 cursor-pointer" onClick={handleClickProfile}>
      <div className="flex items-center gap-2">
        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200">
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt={`${nickname} 프로필`}
              className="size-full object-cover"
            />
          ) : (
            <CircleUserRound className="size-8 text-gray-500" strokeWidth={1.5} />
          )}
        </div>
        <span className="truncate text-heading-2 font-bold text-gray-900">{nickname}</span>
      </div>

      <div className="flex min-w-0 items-center gap-2">
        <span className="inline-flex shrink-0 items-center gap-1 rounded-4xl bg-mint-500 px-2.5 py-1 text-label-1 font-medium text-white">
          <Heart className="size-3.5 fill-white" strokeWidth={1.5} />
          {rating}점
        </span>
      </div>
    </section>
  );
}
