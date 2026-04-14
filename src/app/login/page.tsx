"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    // 🔥 FAKE LOGIN (sem firebase)
    setTimeout(() => {
      router.push("/");
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Button onClick={handleLogin} disabled={loading}>
        {loading ? "Entering..." : "Login"}
      </Button>
    </div>
  );
}