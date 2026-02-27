import { useNavigate } from "react-router-dom";

import type { ProfileUpdateData } from "@/types/profile";

import { Toast } from "@/store/shared/toast/toast.store";

import { usePatchUserProfile } from "@/queries/user";

export function useProfileEditSubmit() {
  const navigate = useNavigate();
  const { mutateAsync: updateProfile, isPending: isProfileUpdatePending } = usePatchUserProfile();

  const onSubmit = async (data: ProfileUpdateData) => {
    try {
      await updateProfile({
        nickname: data.nickname,
        gender: data.gender,
        ageGroup: data.ageGroup,
        introduction: data.introduction,
        profileImageUrl: data.profileImageUrl,
        photoStyles: data.photoStyles,
      });
      Toast.show({ type: "success", message: "프로필 변경이 완료됐어요." });
      navigate("/mypage/profile");
    } catch {
      Toast.show({ type: "error", message: "프로필 변경에 실패했어요." });
    }
  };

  return {
    onSubmit,
    isProfileUpdatePending,
  };
}
