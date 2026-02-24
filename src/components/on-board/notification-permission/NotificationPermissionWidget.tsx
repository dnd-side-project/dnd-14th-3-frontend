import { useEffect, useState } from "react";

import { logger } from "@sentry/react";

import { NOTIFICATION_DENIED_GUIDE } from "@/constants/permission";

import { Toast } from "@/store/shared/toast/toast.store";

import { useNotificationPermission } from "@/hooks/on-board";

import { useGetUserProfile, usePatchUserConsents } from "@/queries/user";

import Button from "@/components/shared/button/Button";
import { LoadingIndicator } from "@/components/shared/loading";
import { Popup } from "@/components/shared/popup";

interface NotificationPermissionWidgetProps {
  /** notification permission step 완료 시 */
  onComplete: () => void;
}

const CONSENT_ERROR_MESSAGE = "설정 저장에 실패했습니다. 다시 시도해주세요.";

export default function NotificationPermissionWidget({
  onComplete,
}: NotificationPermissionWidgetProps) {
  const [showDeniedGuide, setShowDeniedGuide] = useState(false);
  const { data: userProfile } = useGetUserProfile();
  const { requestPermission, isRequesting, isSupported } = useNotificationPermission();
  const { mutateAsync: patchUserConsents, isPending } = usePatchUserConsents();

  const nickname = userProfile?.nickname ?? "회원";

  useEffect(() => {
    if (isSupported) return;
    patchUserConsents({ notificationAllowed: false, locationAllowed: false })
      .then(() => { onComplete(); logger.info("NotificationPermissionWidget: consent saved") })
      .catch(() => Toast.show({ type: "error", message: CONSENT_ERROR_MESSAGE }));

    // 컴포넌트가 마운트될 때만 실행하기 위해 의존성 배열에 빈 배열 전달
    // eslint-hooks/exhaustive-deps 경고 무시
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isSupported) {
    return (<div className="flex h-full items-center justify-center">
      <LoadingIndicator />
      <p>프로필 완성하는 중...
      </p></div>);
  }

  const handleNotificationAllow = async () => {
    try {
      const result = await requestPermission();
      if (result === "denied") {
        setShowDeniedGuide(true);
        return;
      }
      await patchUserConsents({
        notificationAllowed: true,
        locationAllowed: false,
      });
      onComplete();
    } catch {
      Toast.show({ type: "error", message: CONSENT_ERROR_MESSAGE });
    }
  };

  const handleNotificationSkip = async () => {
    try {
      await patchUserConsents({
        notificationAllowed: false,
        locationAllowed: false,
      });
      onComplete();
    } catch {
      Toast.show({ type: "error", message: CONSENT_ERROR_MESSAGE });
    }
  };

  return (
    <>
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
          <Button.Primary fullWidth size="large" onClick={handleNotificationAllow} disabled={isRequesting || isPending}>
            {isPending ? <LoadingIndicator /> : "알림 허용하기"}
          </Button.Primary>
          <Button.Secondary fullWidth size="large" onClick={handleNotificationSkip} disabled={isRequesting || isPending}>
            {isPending ? <LoadingIndicator /> : "다음에 할게요"}
          </Button.Secondary>
        </div>
      </section>
      <Popup
        isOpen={showDeniedGuide}
        showCancel={false}
        confirmMessage="확인"
        onClose={() => setShowDeniedGuide(false)}
        onConfirm={() => {
          setShowDeniedGuide(false);
        }}
        {...NOTIFICATION_DENIED_GUIDE}
      />
    </>
  );
}
