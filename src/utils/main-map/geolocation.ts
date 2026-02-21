import { type LatLng } from "@/types/main-map/location.type";

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
