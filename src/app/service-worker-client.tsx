"use client";

import { useEffect } from "react";

export default function ServiceWorkerClient() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("SW registered:", registration.scope);
          })
          .catch((err) => {
            console.error("SW registration failed:", err);
          });
      });
    }
  }, []);

  return null;
}

