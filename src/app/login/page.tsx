"use client";

import { useState } from "react";
import { login } from "@/lib/authClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  function handleLogin() {
    if (!email) {
      alert("Type something");
      return;
    }

    login(email);

    window.location.href = "/";
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Login</h1>

      <input
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button onClick={handleLogin}>Enter</button>
    </div>
  );
}