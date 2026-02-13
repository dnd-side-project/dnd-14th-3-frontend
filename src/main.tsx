import { StrictMode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";

import "./index.css";

import App from "./App";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

// Sentry 초기화
// 환경 변수에 SENTRY_DSN이 설정되어 있는 경우에만 초기화
if (sentryDsn && typeof sentryDsn === "string" && sentryDsn.trim() !== "") {
  Sentry.init({
    // 에러/이벤트가 전송될 Sentry 프로젝트 주소. Client Keys (DSN)에서 확인 가능.
    dsn: sentryDsn,
    // 이벤트를 구분할 환경 이름. development / production 등. 대시보드 필터·알림 규칙에 사용.
    environment: import.meta.env.MODE,
    // 브라우저 성능 추적: 페이지 로드 시간, 네비게이션, API 요청 등 트랜잭션 수집.
    integrations: [Sentry.browserTracingIntegration()],
    // 성능 트랜잭션 수집 비율. 0~1 (1.0 = 100%). 트래픽이 크면 0.1 등으로 낮춰도 됨.
    tracesSampleRate: 0.5,
  });
}

async function enableMocking() {
  if (import.meta.env.MODE !== "development") return;
  if (import.meta.env.VITE_MSW_ENABLED !== "true") return;
  const { worker } = await import("./mocks/browser");
  return worker.start({ onUnhandledRequest: "bypass" });
}

function renderApp() {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>
  );
}

enableMocking()
  .catch((error) => {
    console.warn("MSW init failed; rendering without mocks.", error);
  })
  .finally(() => renderApp());
