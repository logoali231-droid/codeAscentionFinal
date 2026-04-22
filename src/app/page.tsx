"use client";

import { useEffect, useState } from "react";
import { getUser, logout } from "@/lib/authClient";

export default function Home() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = getUser();

    if (!u) {
      window.location.href = "/login";
      return;
    }

    setUser(u);
  }, []);

  function handleLogout() {
    logout();
    window.location.href = "/login";
  }

  if (!user) return <div className="p-4">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white">
      <h1 className="text-2xl font-bold">Home</h1>
      <p>Welcome: {user.email}</p>

      <button
        onClick={handleLogout}
        className="bg-red-600 px-4 py-2 rounded mt-4"
      >
        Logout
      </button>
    </div>
  );
}