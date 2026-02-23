/// <reference types="vite/client" />
/// <reference types="kakao.maps.d.ts" />

declare global {
  interface GtagWindow {
    gtag: (
      command: "event" | "config" | "js",
      target: string | Date,
      params?: Record<string, string | number | boolean>
    ) => void;
  }

  interface Window {
    kakao: typeof kakao;
    gtag?: GtagWindow["gtag"];
  }
}

export {};
