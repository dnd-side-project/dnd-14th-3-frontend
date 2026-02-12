import { StrictMode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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

enableMocking().
catch((error) => {
  console.warn("MSW init failed; rendering without mocks.", error);
})
.finally(() => renderApp());
