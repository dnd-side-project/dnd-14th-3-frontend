import { useCallback, useMemo, useState } from "react";

import {
  getNotificationPermission,
  isNotificationSupported,
  type NotificationPermissionStatus,
  requestNotificationPermission
} from "@/lib/permission";

export interface UseNotificationPermissionResult {
  /** 현재 알림 권한 상태. 미지원 시 null */
  permission: NotificationPermissionStatus | null;
  /** Notification API 지원 여부 */
  isSupported: boolean;
  /** 권한 요청 중 여부 */
  isRequesting: boolean;
  /** 권한 요청 실행. 사용자 제스처(클릭) 맥락에서 호출 권장 */
  requestPermission: () => Promise<NotificationPermissionStatus | null>;
}

/**
 * 알림 권한 확인 및 요청 로직.
 * onAllow 시 requestPermission()을 호출한 뒤 결과에 따라 다음 동작(예: 라우팅)을 이어가면 됩니다.
 */
export function useNotificationPermission(): UseNotificationPermissionResult {
  const [permission, setPermission] = useState<NotificationPermissionStatus | null>(() =>
    getNotificationPermission()
  );
  const [isRequesting, setIsRequesting] = useState(false);

  const requestPermission = useCallback(async () => {
    setIsRequesting(true);
    try {
      const result = await requestNotificationPermission();
      setPermission(result);
      return result;
    } finally {
      setIsRequesting(false);
    }
  }, []);

  const isSupported = useMemo(() => isNotificationSupported(), []);

  return {
    permission,
    isSupported,
    isRequesting,
    requestPermission,
  };
}
