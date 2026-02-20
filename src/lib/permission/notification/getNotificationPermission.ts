import type { NotificationPermissionStatus } from "@/types/permission";

import { isNotificationSupported } from "./isNotificationSupported";

/**
 * 현재 알림 권한 상태. 지원하지 않으면 null.
 */
export function getNotificationPermission(): NotificationPermissionStatus | null {
  if (!isNotificationSupported()) return null;
  return Notification.permission as NotificationPermissionStatus;
}
