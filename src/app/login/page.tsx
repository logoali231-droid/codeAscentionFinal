"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Rocket, User, ArrowRight, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { localDb } from "@/lib/local-db";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // If a profile already holds, just jump into the app.
    const profile = localDb.getProfile();
    if (profile) {
      router.replace("/");
    }
  }, [router]);

  const handleInitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      localDb.setProfile({
        uid: crypto.randomUUID(),
        displayName: name || "Anonymous Pilot",
        email: "offline_pilot@local",
        createdAt: new Date().toISOString(),
        selectedTopic: null
      });
      // Route them to topics selection by default since it's a new profile
      router.push("/topics");
    } catch (err: any) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top,_var(--color-primary)_0%,_transparent_20%)]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="inline-block p-4 bg-primary/20 rounded-3xl glow-blue mb-4">
            <Rocket className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">
            Offline Protocol
          </h1>
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            100% Local Profile Initializing
          </p>
        </div>

        <form onSubmit={handleInitProfile} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Enter Pilot Name (Optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-secondary/40 border border-border rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-bold tracking-wide"
            />
          </div>

          <Button 
            disabled={loading}
            className="w-full h-14 rounded-2xl text-lg font-black uppercase tracking-widest bg-primary hover:bg-primary/90 glow-blue text-white group italic shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.3)]"
          >
            {loading ? "Booting Subsystems..." : "Initialize Local Brain"}
            {!loading && <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </Button>
        </form>

        <div className="text-center pt-8">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-50">
              Zero cloud sync. All data stays on device.
            </p>
        </div>
      </motion.div>
    </div>
  );
}
