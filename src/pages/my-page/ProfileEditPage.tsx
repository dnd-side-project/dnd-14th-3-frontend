import { FormProvider } from "react-hook-form";

import { getAgeGroupLabel, getGenderLabel } from "@/constants/my-page/profile-edit";

import {
  useProfileEditDrawer,
  useProfileEditForm,
  useProfileEditSubmit,
} from "@/hooks/my-page/profile-edit";

import { ProfileEditDrawer, ProfileEditItem } from "@/components/my-page/profile-edit";
import { Button } from "@/components/shared/button";

export default function ProfileEditPage() {
  const {
    methods,
    setValue,
    reset,
    getValues,
    handleSubmit,
    formState: { isDirty, isSubmitting },
    watched,
  } = useProfileEditForm();

  const { editSubject, openDrawer, handleConfirm, handleClose } = useProfileEditDrawer({
    setValue,
    reset,
    getValues,
  });

  const { onSubmit, isProfileUpdatePending } = useProfileEditSubmit();

  return (
    <FormProvider {...methods}>
      <div className="h-full flex flex-col">
        <div className="overflow-hidden border-gray-100 bg-white flex-1">
          <ProfileEditItem
            label="닉네임"
            content={watched.nickname}
            onClick={() => openDrawer("nickname")}
          />
          <ProfileEditItem
            label="성별"
            content={watched.gender ? getGenderLabel(watched.gender) : ""}
            onClick={() => openDrawer("gender")}
          />
          <ProfileEditItem
            label="촬영 스타일"
            content={watched.photoStyleLabels.join(", ")}
            onClick={() => openDrawer("photoStyle")}
          />
          <ProfileEditItem
            label="연령대"
            content={watched.ageGroup ? getAgeGroupLabel(watched.ageGroup) : ""}
            onClick={() => openDrawer("ageGroup")}
          />
          <ProfileEditItem
            label="자기소개"
            content={watched.introduction}
            onClick={() => openDrawer("introduction")}
          />
        </div>

        <div className="bg-white px-5 py-4">
          <Button.Primary
            fullWidth
            size="large"
            disabled={!isDirty || isSubmitting || isProfileUpdatePending}
            onClick={handleSubmit(onSubmit)}
          >
            프로필 수정
          </Button.Primary>
        </div>

        <ProfileEditDrawer
          editSubject={editSubject}
          onConfirm={handleConfirm}
          onClose={handleClose}
        />
      </div>
    </FormProvider>
  );
}
