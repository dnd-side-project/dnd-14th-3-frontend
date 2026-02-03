import { StrictMode } from "react";

import { createRoot } from "react-dom/client";

import "./index.css";

import App from "./App";

async function enableMocking() {
  if (import.meta.env.MODE !== "development") return;
  if (import.meta.env.VITE_MSW_ENABLED !== "true") return;
  const { worker } = await import("./mocks/browser");
  return worker.start({ onUnhandledRequest: "bypass" });
}

function renderApp() {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

enableMocking().
catch((error) => {
  console.warn("MSW init failed; rendering without mocks.", error);
})
.finally(() => renderApp());
