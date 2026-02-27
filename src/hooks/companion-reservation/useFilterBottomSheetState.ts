import { useEffect, useState } from "react";

import type { FilterValues } from "@/types/companion-reservation";
import { Gender } from "@/types/profile";

import { DEFAULT_FILTER_VALUES, hasAnyFilter } from "@/lib/companion-reservation/filterBottomSheet";

import { useBottomSheet } from "@/hooks/shared/bottom-sheet";

interface UseFilterBottomSheetStateParams {
  isOpen: boolean;
  initialValues?: FilterValues;
  onClose: () => void;
  onApply: (values: FilterValues) => void;
}

interface UseFilterBottomSheetStateReturn {
  values: FilterValues;
  bottomSheet: ReturnType<typeof useBottomSheet>;
  isActionDisabled: boolean;
  handleDateChange: (date: Date | null) => void;
  handleSelectAge: (age: string) => void;
  handleSelectGender: (gender: Gender) => void;
  handleSelectRegion: (region: string) => void;
  handleReset: () => void;
  handleClose: () => void;
  handleApply: () => void;
}

export function useFilterBottomSheetState({
  isOpen,
  initialValues,
  onClose,
  onApply,
}: UseFilterBottomSheetStateParams): UseFilterBottomSheetStateReturn {
  const [values, setValues] = useState<FilterValues>(initialValues ?? DEFAULT_FILTER_VALUES);
  const { open, close, ...bottomSheet } = useBottomSheet();

  useEffect(() => {
    if (!isOpen) return;
    open();
  }, [isOpen, open]);

  const handleDateChange = (date: Date | null) => {
    setValues((prev) => ({ ...prev, date }));
  };

  const handleSelectAge = (age: string) => {
    setValues((prev) => ({
      ...prev,
      ageGroup: prev.ageGroup === age ? null : age,
    }));
  };

  const handleSelectGender = (gender: Gender) => {
    setValues((prev) => ({
      ...prev,
      gender: prev.gender === gender ? null : gender,
    }));
  };

  const handleSelectRegion = (region: string) => {
    setValues((prev) => ({
      ...prev,
      region: prev.region === region ? null : region,
    }));
  };

  const handleReset = () => {
    setValues((prev) => ({ ...prev, ageGroup: null, gender: null, region: null, date: null }));
    onApply(DEFAULT_FILTER_VALUES);
  };

  const handleClose = () => {
    onClose();
    close();
  };

  const handleApply = () => {
    onApply(values);
    close();
  };

  return {
    values,
    bottomSheet: { ...bottomSheet, open, close },
    isActionDisabled: !hasAnyFilter(values),
    handleDateChange,
    handleSelectAge,
    handleSelectGender,
    handleSelectRegion,
    handleReset,
    handleClose,
    handleApply,
  };
}
