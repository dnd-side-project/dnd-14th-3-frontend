import { useEffect, useRef, useState } from "react";

import type { UseFormReturn } from "react-hook-form";

import type { AgeRange, Gender, ProfileUpdateData } from "@/types/profile";

import {
  PROFILE_EDIT_SUBJECT_TO_FIELD,
  type ProfileEditSubject,
} from "@/constants/my-page/profile-edit";

interface UseProfileEditDrawerParams {
  setValue: UseFormReturn<ProfileUpdateData>["setValue"];
  reset: UseFormReturn<ProfileUpdateData>["reset"];
  getValues: UseFormReturn<ProfileUpdateData>["getValues"];
}

export function useProfileEditDrawer({
  setValue,
  reset,
  getValues,
}: UseProfileEditDrawerParams) {
  const [editSubject, setEditSubject] = useState<ProfileEditSubject | null>(null);
  const valuesOnDrawerOpen = useRef<ProfileUpdateData | null>(null);

  useEffect(() => {
    if (editSubject) {
      valuesOnDrawerOpen.current = getValues();
    } else {
      valuesOnDrawerOpen.current = null;
    }
  }, [editSubject, getValues]);

  const openDrawer = (subject: ProfileEditSubject) => setEditSubject(subject);

  const handleConfirm = (
    subject: ProfileEditSubject,
    value: string | Gender | AgeRange | string[]
  ) => {
    const field = PROFILE_EDIT_SUBJECT_TO_FIELD[subject];
    setValue(field, value as never, { shouldDirty: true });
    setEditSubject(null);
  };

  const handleClose = () => {
    if (valuesOnDrawerOpen.current) {
      reset(valuesOnDrawerOpen.current);
    }
    setEditSubject(null);
  };

  return {
    editSubject,
    openDrawer,
    handleConfirm,
    handleClose,
  };
}
