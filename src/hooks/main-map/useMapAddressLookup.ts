import { useCallback, useEffect, useRef, useState } from "react";

import {
  type LatLng,
  type LocationAddressInfo,
} from "@/types/main-map/location.type";

import { ADDRESS_LOOKUP_TIMEOUT_MS } from "@/constants/main-map/location.constants";

export function useMapAddressLookup(isSheetOpen: boolean) {
  const [addressInfo, setAddressInfo] = useState<LocationAddressInfo | null>(null);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const addressRequestSeqRef = useRef(0);

  const lookupAddress = useCallback((location: LatLng) => {
    if (typeof window === "undefined" || !window.kakao?.maps?.services) {
      setAddressInfo(null);
      setIsResolvingAddress(false);
      return;
    }

    const geocoder = new window.kakao.maps.services.Geocoder();
    const requestSeq = addressRequestSeqRef.current + 1;
    addressRequestSeqRef.current = requestSeq;
    setIsResolvingAddress(true);

    const fallbackTimer = window.setTimeout(() => {
      if (addressRequestSeqRef.current !== requestSeq) return;
      setAddressInfo(null);
      setIsResolvingAddress(false);
    }, ADDRESS_LOOKUP_TIMEOUT_MS);

    geocoder.coord2Address(location.lng, location.lat, (result, status) => {
      if (addressRequestSeqRef.current !== requestSeq) return;
      window.clearTimeout(fallbackTimer);

      if (status !== window.kakao.maps.services.Status.OK || !result[0]) {
        setAddressInfo(null);
        setIsResolvingAddress(false);
        return;
      }

      const first = result[0];
      setAddressInfo({
        roadAddress: first.road_address?.address_name ?? "",
        jibunAddress: first.address?.address_name ?? "",
        buildingName: first.road_address?.building_name ?? "",
      });
      setIsResolvingAddress(false);
    });
  }, []);

  useEffect(() => {
    if (!isSheetOpen || !isResolvingAddress) return;
    const watchdog = window.setTimeout(() => {
      setIsResolvingAddress(false);
    }, 6000);

    return () => window.clearTimeout(watchdog);
  }, [isSheetOpen, isResolvingAddress]);

  return {
    addressInfo,
    isResolvingAddress,
    lookupAddress,
  };
}
