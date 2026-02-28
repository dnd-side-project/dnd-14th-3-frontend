import { createPortal } from "react-dom";

import { AnimatePresence, motion } from "framer-motion";

import { X } from "lucide-react";
import { useFormContext } from "react-hook-form";

import type { AgeRange, Gender, ProfileUpdateData } from "@/types/profile";

import { PROFILE_EDIT_SUBJECT_LABELS } from "@/constants/my-page/profile-edit";

import { AgeGroupEditDrawer } from "./AgeGroupEditDrawer";
import { GenderEditDrawer } from "./GenderEditDrawer";
import { IntroductionEditDrawer } from "./IntroductionEditDrawer";
import { NicknameEditDrawer } from "./NicknameEditDrawer";
import { PhotoStyleEditDrawer } from "./PhotoStyleEditDrawer";

const MOBILE_LAYOUT_ID = "mobile-layout";

type EditSubject = "nickname" | "gender" | "ageGroup" | "photoStyle" | "introduction";

interface ProfileEditDrawerProps {
  editSubject: EditSubject | null;
  onConfirm: (
    subject: EditSubject,
    value: string | Gender | AgeRange | string[]
  ) => void;
  onClose: () => void;
}

export function ProfileEditDrawer({
  editSubject,
  onConfirm,
  onClose,
}: ProfileEditDrawerProps) {
  const { getValues } = useFormContext<ProfileUpdateData>();

  const initialValues = editSubject
    ? {
        nickname: getValues("nickname") ?? "",
        gender: getValues("gender") ?? "",
        ageGroup: getValues("ageGroup") ?? "",
        photoStyle: getValues("photoStyles") ?? [],
        introduction: getValues("introduction") ?? "",
      }
    : null;

  const drawerContent = (
    <AnimatePresence>
      {editSubject && (
        <motion.div
          key={editSubject}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 z-20 flex flex-col bg-white"
        >
          <header className="sticky top-0 z-10 h-14 border-b border-gray-100 bg-white px-4 shrink-0">
            <div className="flex h-full items-center gap-2">
              <button
                type="button"
                aria-label="닫기"
                onClick={onClose}
                className="cursor-pointer rounded-md text-gray-700 p-1"
              >
                <X className="h-5 w-5" strokeWidth={1.9} />
              </button>
              <span className="text-body-1 font-medium text-gray-900">
                {PROFILE_EDIT_SUBJECT_LABELS[editSubject]} 변경
              </span>
            </div>
          </header>

          {editSubject === "nickname" && initialValues && (
            <NicknameEditDrawer
              initialValue={initialValues.nickname}
              onConfirm={(value) => onConfirm("nickname", value)}
            />
          )}
          {editSubject === "gender" && initialValues && (
            <GenderEditDrawer
              initialValue={initialValues.gender}
              onConfirm={(value) => onConfirm("gender", value)}
            />
          )}
          {editSubject === "photoStyle" && initialValues && (
            <PhotoStyleEditDrawer
              initialValue={initialValues.photoStyle}
              onConfirm={(value) => onConfirm("photoStyle", value)}
            />
          )}
          {editSubject === "ageGroup" && initialValues && (
            <AgeGroupEditDrawer
              initialValue={initialValues.ageGroup}
              onConfirm={(value) => onConfirm("ageGroup", value)}
            />
          )}
          {editSubject === "introduction" && initialValues && (
            <IntroductionEditDrawer
              initialValue={initialValues.introduction}
              onConfirm={(value) => onConfirm("introduction", value)}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  const container = typeof document !== "undefined" ? document.getElementById(MOBILE_LAYOUT_ID) : null;

  if (container) {
    return createPortal(drawerContent, container);
  }

  return drawerContent;
}
