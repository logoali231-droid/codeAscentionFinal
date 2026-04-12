"use client";

import { useState, useEffect } from "react";
import { useUser, useAuth } from "@/firebase/provider";
import { signOutUser } from "@/firebase/auth";
import { useRouter } from "next/navigation";
import { ChevronLeft, LogOut, Bell, Moon, Shield, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const auth = useAuth();
  const router = useRouter();

  // Initialize and apply dark mode class on client
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
    return <div className="min-h-screen bg-background flex flex-col items-center justify-center glow-blue text-primary animate-pulse"><Rocket className="w-12 h-12" /></div>;
  }

  const handleSignOut = async () => {
    if (auth) {
      await signOutUser(auth);
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Header */}
      <header className="p-6 sticky top-0 z-40 bg-background/80 backdrop-blur-md flex items-center gap-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h1 className="font-headline font-bold text-xl tracking-tight uppercase">Configuration</h1>
      </header>

      <main className="px-6 pt-8 space-y-8 max-w-xl mx-auto">
        {/* Account Info */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
            <Shield className="w-4 h-4" /> Account
          </h2>
          <div className="bg-secondary/30 rounded-2xl border border-border p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground font-bold font-body">Email Address</span>
              <span className="text-sm font-bold opacity-80">{user?.email || "Not registered"}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground font-bold font-body">Account Status</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-2 py-1 rounded-full glow-green">Active</span>
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
            <Moon className="w-4 h-4" /> Preferences
          </h2>
          <div className="bg-secondary/30 rounded-2xl border border-border p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <div className="flex flex-col">
                <span className="text-sm font-bold font-body">Dark Mode</span>
                <span className="text-xs text-muted-foreground">Always true to the hacker aesthetic.</span>
              </div>
              <Switch 
                checked={isDarkMode} 
                onCheckedChange={setIsDarkMode} 
                className="data-[state=checked]:bg-accent data-[state=checked]:shadow-[0_0_10px_rgba(13,242,13,0.3)]"
              />
            </div>
            <div className="flex justify-between items-center py-2">
              <div className="flex flex-col">
                <span className="text-sm font-bold font-body flex items-center gap-2">
                  Push Notifications <Bell className="w-3 h-3 text-muted-foreground" />
                </span>
                <span className="text-xs text-muted-foreground">Get reminded of your daily coding streak.</span>
              </div>
              <Switch 
                checked={notificationsEnabled} 
                onCheckedChange={setNotificationsEnabled} 
                className="data-[state=checked]:bg-primary data-[state=checked]:shadow-[0_0_10px_rgba(31,158,255,0.3)]"
              />
            </div>
          </div>
        </section>

        {/* Actions */}
        <section className="pt-8">
          <Button 
            variant="destructive" 
            className="w-full flex gap-2 font-bold uppercase tracking-widest h-12 rounded-xl"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" /> Terminate Session
          </Button>
        </section>
      </main>
    </div>
  );
}
