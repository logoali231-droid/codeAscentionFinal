"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const user = localStorage.getItem("user");

    if (!user) {
      window.location.href = "/login";
    }
  }, []);

  return (
    <div className="text-white bg-black min-h-screen p-6">
      <h1 className="text-2xl">Home</h1>
    </div>
  );
}