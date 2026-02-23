import type { NotificationPermissionStatus } from "@/types/permission";

import { isNotificationSupported } from "./isNotificationSupported";

/**
 * 사용자에게 알림 권한 요청.
 * 사용자 제스처(클릭 등) 맥락에서 호출하는 것이 좋습니다.
 * @returns 권한 결과. 미지원 시 null
 */
export function requestNotificationPermission(): Promise<NotificationPermissionStatus | null> {
  if (!isNotificationSupported()) {
    return Promise.resolve(null);
  }
  return Notification.requestPermission();
}
