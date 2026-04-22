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

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-zinc-900 text-white p-6 rounded-xl">
        <h1 className="text-xl">Welcome</h1>
        <p>{user.email}</p>

        <button
          onClick={() => {
            logout();
            window.location.href = "/login";
          }}
          className="mt-4 bg-red-500 px-3 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
}