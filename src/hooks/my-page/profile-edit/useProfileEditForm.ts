import { useEffect, useMemo } from "react";

import { useForm, useWatch } from "react-hook-form";

import type { AgeRange, Gender, ProfileUpdateData } from "@/types/profile";

import { usePhotoStyles } from "@/queries/user";
import { useGetUserProfile } from "@/queries/user/useGetUserProfile";

export function useProfileEditForm() {
  const { data: profile } = useGetUserProfile();
  const { data: photoStyles } = usePhotoStyles();

  const methods = useForm<ProfileUpdateData>({
    defaultValues: {
      nickname: profile?.nickname ?? "",
      gender: (profile?.gender ?? "") as Gender,
      ageGroup: (profile?.ageGroup ?? "TWENTIES") as AgeRange,
      introduction: profile?.introduction ?? "",
      profileImageUrl: profile?.profileImageUrl,
      photoStyles: profile?.photoStyles ?? [],
    },
  });

  const { setValue, reset, getValues, control, handleSubmit, formState } = methods;

  const watchedNickname = useWatch({ control, name: "nickname" });
  const watchedGender = useWatch({ control, name: "gender" });
  const watchedAgeGroup = useWatch({ control, name: "ageGroup" });
  const watchedIntroduction = useWatch({ control, name: "introduction" });
  const watchedPhotoStyles = useWatch({ control, name: "photoStyles" });

  const photoStyleLabelMap = useMemo(
    () => new Map((photoStyles ?? []).map((style) => [style.name, style.label])),
    [photoStyles]
  );

  const watchedPhotoStyleLabels = useMemo(
    () =>
      (watchedPhotoStyles ?? []).map((styleName) => photoStyleLabelMap.get(styleName) ?? styleName),
    [watchedPhotoStyles, photoStyleLabelMap]
  );

  useEffect(() => {
    if (profile) {
      reset({
        nickname: profile.nickname ?? "",
        gender: (profile.gender ?? "") as Gender,
        ageGroup: (profile.ageGroup ?? "TWENTIES") as AgeRange,
        introduction: profile.introduction ?? "",
        profileImageUrl: profile.profileImageUrl,
        photoStyles: profile.photoStyles ?? [],
      });
    }
  }, [profile, reset]);

  return {
    methods,
    setValue,
    reset,
    getValues,
    handleSubmit,
    formState,
    watched: {
      nickname: watchedNickname ?? "",
      gender: watchedGender ?? "",
      ageGroup: watchedAgeGroup ?? "",
      introduction: watchedIntroduction ?? "",
      photoStyleLabels: watchedPhotoStyleLabels,
    },
  };
}
