import { useCallback, useEffect, useRef, useState } from "react";

import { Search, X } from "lucide-react";

import { type LatLng, type SearchLocationResult } from "@/types/main-map/location.type";

import { LoadingIndicator } from "@/components/shared/loading";

interface ManualLocationSearchOverlayProps {
  isOpen: boolean;
  onSelectLocation: (location: LatLng) => void;
}

// 주소/위치 검색창
export default function ManualLocationSearchOverlay({
  isOpen,
  onSelectLocation,
}: ManualLocationSearchOverlayProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchLocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRequestSeqRef = useRef(0);

  const handleSearchLocation = useCallback(
    (query: string) =>
      new Promise<SearchLocationResult[]>((resolve) => {
        if (typeof window === "undefined" || !window.kakao?.maps?.services) {
          resolve([]);
          return;
        }

        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.addressSearch(query, (addressResults, addressStatus) => {
          if (addressStatus === window.kakao.maps.services.Status.OK && addressResults.length > 0) {
            const results: SearchLocationResult[] = addressResults.map((item, index) => ({
              id: `address-${item.x}-${item.y}-${index}`,
              title: item.address_name,
              address: item.road_address?.address_name ?? item.address_name,
              location: { lat: Number(item.y), lng: Number(item.x) },
            }));
            resolve(results);
            return;
          }

          const places = new window.kakao.maps.services.Places();
          places.keywordSearch(query, (keywordResults, keywordStatus) => {
            if (
              keywordStatus !== window.kakao.maps.services.Status.OK ||
              keywordResults.length === 0
            ) {
              resolve([]);
              return;
            }

            const results: SearchLocationResult[] = keywordResults.map((item, index) => ({
              id: `place-${item.id ?? `${item.x}-${item.y}`}-${index}`,
              title: item.place_name,
              address: item.road_address_name || item.address_name,
              location: { lat: Number(item.y), lng: Number(item.x) },
            }));
            resolve(results);
          });
        });
      }),
    []
  );

  useEffect(() => {
    if (!isOpen) return;
    searchRequestSeqRef.current += 1;
    setSearchQuery("");
    setSearchResults([]);
    setIsSearching(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const query = searchQuery.trim();
    if (!query) {
      setIsSearching(false);
      if (searchResults.length > 0) setSearchResults([]);
      return;
    }

    const requestSeq = searchRequestSeqRef.current + 1;
    searchRequestSeqRef.current = requestSeq;

    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await handleSearchLocation(query);
        if (searchRequestSeqRef.current !== requestSeq) return;
        setSearchResults(results);
      } finally {
        if (searchRequestSeqRef.current === requestSeq) setIsSearching(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [handleSearchLocation, isOpen, searchQuery, searchResults.length]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-30 bg-white">
      <div className="mx-auto flex h-full w-full flex-col">
        <div className="relative mx-4 mt-6 mb-2">
          <Search
            size={19}
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            placeholder="지역/주소를 검색해주세요"
            className="w-full rounded bg-gray-100 py-4 pr-14 pl-12 text-label-1 text-gray-900 outline-none"
          />
          {searchQuery ? (
            <button
              type="button"
              aria-label="검색어 지우기"
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
              }}
              className="absolute top-1/2 right-4 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-gray-500"
            >
              <X size={12} className="cursor-pointer text-white" />
            </button>
          ) : null}
        </div>

        {isSearching ? (
          <div className="mt-3 flex justify-center py-2">
            <LoadingIndicator />
          </div>
        ) : (
          <ul className="mobile-scroll-container flex-1 overflow-y-auto bg-white">
            {searchResults.map((result) => (
              <li key={result.id}>
                <div
                  className="w-full cursor-pointer rounded-xl text-left"
                  onClick={() => onSelectLocation(result.location)}
                >
                  <div className="px-6 py-4">
                    <p className="text-body-1 text-mint">{result.title}</p>
                    <p className="mt-1 text-label-2 text-gray-500">{result.address}</p>
                  </div>
                  <hr className="text-gray-200" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
