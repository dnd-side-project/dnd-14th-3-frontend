export interface GeocodeAddressResult {
  address: kakao.maps.services.Address;
  road_address: {
    building_name?: string;
    address_name?: string;
  } | null;
}

export interface ResolvedAddressInfo {
  addressName: string;
  buildingName: string;
  specificPlace: string | undefined;
}

export function searchAddrFromCoords(
  coords: kakao.maps.LatLng,
  callback: (result: GeocodeAddressResult[], status: kakao.maps.services.Status) => void
) {
  if (typeof window === "undefined" || !window.kakao?.maps?.services) return;
  const geocoder = new window.kakao.maps.services.Geocoder();
  geocoder.coord2Address(coords.getLng(), coords.getLat(), callback);
}

export function resolveAddressInfo(results: GeocodeAddressResult[]): ResolvedAddressInfo {
  const first = results[0];
  const addressName = first?.address?.address_name ?? "";
  const buildingName = first?.road_address?.building_name ?? "";

  return {
    addressName,
    buildingName,
    specificPlace: buildingName || addressName || undefined,
  };
}
