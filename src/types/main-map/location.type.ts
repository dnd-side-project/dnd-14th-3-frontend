export type LatLng = { lat: number; lng: number };

export interface LocationAddressInfo {
  roadAddress: string;
  jibunAddress: string;
  buildingName: string;
}

export interface SearchLocationResult {
  id: string;
  title: string;
  address: string;
  location: LatLng;
}
