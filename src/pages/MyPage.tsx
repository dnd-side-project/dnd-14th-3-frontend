import { useGetMyPageSummary } from "@/queries/my-page/useGetMyPageSummary";

import {
  MyPageCompanionCard,
  MyPageCompanionRecords,
  MyPageCompanionSchedule,
  MyPageMenuList,
  MyPageProfileSection,
} from "@/components/my-page";
import { LoadingIndicator } from "@/components/shared/loading";

const HARDCODED_PROFILE_IMAGE_URL = "https://example.com/profile.jpg";
const HARDCODED_RATING = 4.8;
const HARDCODED_COMPANION_COUNT = 12;

export default function MyPage() {
  const { data: summary, isLoading, isError } = useGetMyPageSummary();

  if (isLoading || isError || !summary) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingIndicator />
      </div>
    );
  }

  const displaySummary = {
    ...summary,
    profileImageUrl: HARDCODED_PROFILE_IMAGE_URL,
    rating: HARDCODED_RATING,
    companionCount: HARDCODED_COMPANION_COUNT,
  };

  return (
    <div className="flex flex-col pb-4">
      <MyPageProfileSection summary={displaySummary} />
      <MyPageCompanionCard companionCount={displaySummary.companionCount} />
      <div className="mt-4 overflow-hidden border border-gray-100 bg-white">
        <MyPageCompanionSchedule />
        <MyPageCompanionRecords />
      </div>
      <div className="flex flex-col gap-0 bg-gray-50">
        <div className="mt-4 overflow-hidden border border-gray-100 bg-white">
          <MyPageMenuList />
        </div>
      </div>
    </div>
  );
}
