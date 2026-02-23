/**
 * 현재 환경에서 Notification API 사용 가능 여부.
 * (HTTPS 또는 localhost, 그리고 Notification 지원)
 */
export function isNotificationSupported(): boolean {
  if (typeof window === "undefined") return false;
  if (!window.isSecureContext) return false;
  return (
    "Notification" in window &&
    typeof Notification !== "undefined" &&
    typeof Notification.requestPermission === "function"
  );
}
