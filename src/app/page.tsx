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

  if (!user) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Home</h1>

      <p>Welcome: {user.email}</p>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}