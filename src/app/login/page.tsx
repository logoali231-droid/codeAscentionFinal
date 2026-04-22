"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  function handleLogin() {
    if (!email) {
      alert("Enter email");
      return;
    }

    localStorage.setItem("user", email);
    window.location.href = "/";
  }

  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
      <div className="space-y-4 w-80">
        <h1 className="text-xl">Enter</h1>

        <input
          className="w-full p-2 text-black"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="bg-green-600 w-full py-2"
        >
          Continue
        </button>
      </div>
    </div>
  );
}