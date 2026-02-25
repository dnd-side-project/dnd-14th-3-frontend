export interface ReservationCardRequesterInfoProps {
  avatarUrl: string;
  description: string;
  className?: string;
}

export default function ReservationCardFooterRequesterInfo({
  avatarUrl,
  description,
  className = "",
}: ReservationCardRequesterInfoProps) {
  return (
    <div
      className={`flex items-center gap-2 text-[14px] font-normal leading-[1.4] text-gray-500 ${className}`}
    >
      <img alt="요청자 프로필" className="size-6 rounded-full object-cover" src={avatarUrl} />
      <span>{description}</span>
    </div>
  );
}
