const LOCATION_CONSENT_STORAGE_KEY = "location_allowed";
const NOTIFICATION_CONSENT_STORAGE_KEY = "notification_allowed";

export function getCachedLocationAllowed(): boolean | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(LOCATION_CONSENT_STORAGE_KEY);
  if (raw === "true") return true;
  if (raw === "false") return false;
  return null;
}

export function setCachedLocationAllowed(value: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCATION_CONSENT_STORAGE_KEY, String(value));
}

export function getCachedNotificationAllowed(): boolean | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(NOTIFICATION_CONSENT_STORAGE_KEY);
  if (raw === "true") return true;
  if (raw === "false") return false;
  return null;
}

export function setCachedNotificationAllowed(value: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NOTIFICATION_CONSENT_STORAGE_KEY, String(value));
}

export function getCachedUserConsents(): {
  locationAllowed: boolean;
  notificationAllowed: boolean;
} | null {
  const locationAllowed = getCachedLocationAllowed();
  const notificationAllowed = getCachedNotificationAllowed();
  if (locationAllowed == null || notificationAllowed == null) return null;
  return { locationAllowed, notificationAllowed };
}

export function setCachedUserConsents(consents: {
  locationAllowed: boolean;
  notificationAllowed: boolean;
}) {
  setCachedLocationAllowed(consents.locationAllowed);
  setCachedNotificationAllowed(consents.notificationAllowed);
}
