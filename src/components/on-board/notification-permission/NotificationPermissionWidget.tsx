import Button from "@/components/shared/button/Button";

interface NotificationPermissionWidgetProps {
  /** 표시할 닉네임 (예: "사진수집가" → "사진수집가님, 가입을 축하드려요!") */
  nickname?: string;
  /** 알림 허용하기 클릭 시 */
  onAllow: () => void;
  /** 다음에 할게요 클릭 시 */
  onSkip: () => void;
  /** 권한 요청 중일 때 true. 알림 허용하기 버튼 비활성화 */
  isRequesting?: boolean;
}

export default function NotificationPermissionWidget({
  nickname = "회원",
  onAllow,
  onSkip,
  isRequesting = false,
}: NotificationPermissionWidgetProps) {
  return (
    <section className="flex grow h-full w-full flex-col bg-white">
      <div className="flex flex-1 flex-col items-center px-5 pt-20">
        <p className="text-center text-body-1 text-gray-500">{nickname}님, 가입을 축하드려요!</p>
        <h2 className="mt-4 text-center text-title-2 font-bold text-gray-900">
          알림 설정을 허용해주세요.
        </h2>
        <img
          src="/on-board/Notification_Permission.png"
          alt=""
          className="mt-12 h-auto w-[200px] object-contain"
          width={200}
          height={200}
        />
        <p className="mt-8 text-center text-body-1 text-gray-500">
          알림을 허용하고
          <br />
          사진 동행 매칭 소식을 실시간으로 받아보세요.
        </p>
      </div>

      <div className="sticky bottom-0 flex flex-col gap-3 px-5 pt-5 pb-[calc(20px+env(safe-area-inset-bottom))] bg-white [&_button]:h-[52px]">
        <Button.Primary fullWidth size="large" onClick={onAllow} disabled={isRequesting}>
          알림 허용하기
        </Button.Primary>
        <Button.Secondary fullWidth size="large" onClick={onSkip} disabled={isRequesting}>
          다음에 할게요
        </Button.Secondary>
      </div>
    </section>
  );
}
