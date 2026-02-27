import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { CircleUserRound } from "lucide-react";

import { useGetUserProfile } from "@/queries/user";

import Popup from "@/components/shared/popup/Popup";
import { Switch } from "@/components/shared/switch";

export default function AccountPage() {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useGetUserProfile();
  const [profilePublic, setProfilePublic] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const handleLogout = () => {
    // TODO: API 호출 후 로그인 페이지로 이동
    navigate("/login", { replace: true });
  };

  const handleWithdraw = () => {
    setShowWithdrawModal(false);
    window.alert("탈퇴하기 동작 없음");
    // TODO: API 호출 후 로그인 페이지로 이동
    navigate("/login", { replace: true });
  };

  if (isLoading || !profile) {
    return (
      <div className="flex min-h-[200px] items-center justify-center px-4">
        <span className="text-body-2 text-gray-500">로딩 중...</span>
      </div>
    );
  }

  const { nickname, profileImageUrl } = profile;

  return (
    <div className="flex min-h-[calc(100dvh-56px)] flex-col pt-2">
      {/* 프로필 섹션 */}
      <div className="flex flex-col items-center gap-3 py-6">
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
        <span className="text-heading-2 font-bold text-gray-900">{nickname}</span>
      </div>

      <div className="h-3 w-full bg-gray-100" />

      {/* 계정 설정 - 라운드 없음, 바닥에 붙음 */}
      <div className="overflow-hidden border border-gray-100 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <span className="text-body-1 font-medium text-gray-900">나의 프로필 공개</span>
          <Switch
            checked={profilePublic}
            onChange={(e) => setProfilePublic(e.target.checked)}
          />
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-between px-5 py-4 text-left text-body-1 font-medium text-gray-900 active:bg-gray-50"
        >
          로그아웃
        </button>
      </div>
      {/* 여백으로 하단 고정 */}
      <div className="flex-1" />
      {/* 탈퇴하기 링크 */}
      <div className="mb-8 mt-8 flex justify-center">
        <button
          type="button"
          onClick={() => setShowWithdrawModal(true)}
          className="text-body-1 text-gray-500 underline underline-offset-2 active:text-gray-600"
        >
          탈퇴하기
        </button>
      </div>

      <Popup
        isOpen={showWithdrawModal}
        title="회원 탈퇴하시겠어요?"
        content={"탈퇴한지 30일 이후부터 재가입할 수 있어요.\n정말 탈퇴하시겠어요?"}
        confirmMessage="탈퇴하기"
        cancelMessage="뒤로가기"
        showConfirm
        showCancel
        onClose={() => setShowWithdrawModal(false)}
        onConfirm={handleWithdraw}
        onCancel={() => setShowWithdrawModal(false)}
      />
    </div>
  );
}
