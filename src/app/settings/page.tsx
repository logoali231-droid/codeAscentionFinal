"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, LogOut, Bell, Moon, Shield, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const router = useRouter();

  // 🔥 FAKE USER (sem firebase)
  const user = {
    email: "local@user.dev"
  };

  const isUserLoading = false;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (isDarkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [isDarkMode]);

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Rocket className="w-12 h-12 animate-pulse" />
      </div>
    );
  }

  const handleSignOut = async () => {
    // 🔥 sem firebase → só redireciona
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <header className="p-6 sticky top-0 flex items-center gap-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h1 className="font-bold text-xl uppercase">Configuration</h1>
      </header>

      <main className="px-6 pt-8 space-y-8 max-w-xl mx-auto">
        
        {/* Account */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase flex items-center gap-2">
            <Shield className="w-4 h-4" /> Account
          </h2>

          <div className="border p-4 rounded-xl">
            <div className="flex justify-between py-2 border-b">
              <span>Email</span>
              <span>{user.email}</span>
            </div>

            <div className="flex justify-between py-2">
              <span>Status</span>
              <span className="text-green-400">Active</span>
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase flex items-center gap-2">
            <Moon className="w-4 h-4" /> Preferences
          </h2>

          <div className="border p-4 rounded-xl space-y-4">
            <div className="flex justify-between items-center">
              <span>Dark Mode</span>
              <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
            </div>

            <div className="flex justify-between items-center">
              <span>Notifications</span>
              <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
            </div>
          </div>
        </section>

        {/* Actions */}
        <section className="pt-8">
          <Button className="w-full" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </section>

      </main>
    </div>
  );
}