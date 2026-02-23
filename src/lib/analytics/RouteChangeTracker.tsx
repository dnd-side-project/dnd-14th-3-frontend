import { useEffect } from "react";

import { useLocation } from "react-router-dom";

function RouteChangeTracker() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag !== "function") return;

    const pagePath = `${location.pathname}${location.search}${location.hash}`;
    window.gtag("event", "page_view", {
      page_location: window.location.href,
      page_path: pagePath,
      page_title: document.title,
    });
  }, [location]);

  return null;
}

export default RouteChangeTracker;
