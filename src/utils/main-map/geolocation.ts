import { type LatLng } from "@/types/main-map/location.type";

export type LocationPermissionState = PermissionState | "unknown";

export async function getLocationPermissionState(): Promise<LocationPermissionState> {
  if (typeof navigator === "undefined") return "unknown";

  if (typeof navigator.permissions?.query === "function") {
    try {
      const status = await navigator.permissions.query({ name: "geolocation" as PermissionName });
      return status.state;
    } catch {
      return "unknown";
    }
  }

  return "unknown";
}

export async function requestCurrentLocation(): Promise<LatLng | null> {
  if (typeof window === "undefined" || window.location.protocol !== "https:") return null;
  if (typeof navigator === "undefined" || !navigator.geolocation) return null;

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 0 }
    );
  });
}
