const LOCATION_CONSENT_STORAGE_KEY = "location_allowed";
const NOTIFICATION_CONSENT_STORAGE_KEY = "notification_allowed";

function buildKey(baseKey: string, userId: string) {
  return `${baseKey}:${userId}`;
}

export function getCachedLocationAllowed(userId: string | null): boolean | null {
  if (!userId || typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(buildKey(LOCATION_CONSENT_STORAGE_KEY, userId));
  if (raw === "true") return true;
  if (raw === "false") return false;
  return null;
}

export function setCachedLocationAllowed(userId: string | null, value: boolean) {
  if (!userId || typeof window === "undefined") return;
  window.localStorage.setItem(buildKey(LOCATION_CONSENT_STORAGE_KEY, userId), String(value));
}

export function getCachedNotificationAllowed(userId: string | null): boolean | null {
  if (!userId || typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(buildKey(NOTIFICATION_CONSENT_STORAGE_KEY, userId));
  if (raw === "true") return true;
  if (raw === "false") return false;
  return null;
}

export function setCachedNotificationAllowed(userId: string | null, value: boolean) {
  if (!userId || typeof window === "undefined") return;
  window.localStorage.setItem(buildKey(NOTIFICATION_CONSENT_STORAGE_KEY, userId), String(value));
}

export function getCachedUserConsents(userId: string | null): {
  locationAllowed: boolean;
  notificationAllowed: boolean;
} | null {
  const locationAllowed = getCachedLocationAllowed(userId);
  const notificationAllowed = getCachedNotificationAllowed(userId);
  if (locationAllowed == null || notificationAllowed == null) return null;
  return { locationAllowed, notificationAllowed };
}

export function setCachedUserConsents(
  userId: string | null,
  consents: {
    locationAllowed: boolean;
    notificationAllowed: boolean;
  }
) {
  setCachedLocationAllowed(userId, consents.locationAllowed);
  setCachedNotificationAllowed(userId, consents.notificationAllowed);
}
