import { Flag } from "lucide-react";

interface MyPageCompanionCardProps {
  companionCount: number;
}

export default function MyPageCompanionCard({ companionCount }: MyPageCompanionCardProps) {

  return (
    <div className="flex items-center mx-4 my-3 px-4.5 py-5 gap-2.5 rounded-2xl bg-mint-500" >
      <div className="flex items-center">
        <Flag className="size-6 shrink-0 text-white" fill="white" strokeWidth={1.5} />
      </div>
      <div className="flex flex-col items-start">
        <p className="text-body-2 text-gray-900">동행 횟수</p>
        <p className="text-title-2 text-gray-900">총 {companionCount}회</p>
      </div>
    </div>
  );
}
