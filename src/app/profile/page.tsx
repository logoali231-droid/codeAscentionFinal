"use client";

import { localDb, LocalPilotProfile } from "@/lib/local-db";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  User as UserIcon, 
  Mail, 
  Award, 
  Target, 
  ShieldCheck, 
  ChevronLeft,
  Settings as SettingsIcon,
  LogOut,
  Brain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<LocalPilotProfile | null>(null);

  useEffect(() => {
    const profile = localDb.getProfile();
    if (!profile) {
      router.replace("/login");
    } else {
      setUser(profile);
    }
  }, [router]);

  const handleSignOut = () => {
    localDb.wipeAllData();
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: "Lessons Completed", value: "12", icon: Award, color: "text-primary" },
    { label: "Logic Score", value: "850", icon: Brain, color: "text-purple-500" },
    { label: "Accuracy", value: "94%", icon: Target, color: "text-green-500" },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24 bg-[radial-gradient(circle_at_bottom_left,_var(--color-primary)_0%,_transparent_15%)]">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-2xl bg-secondary/20 h-12 w-12">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <h1 className="text-xl font-black uppercase tracking-tighter italic">Pilot Profile</h1>
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="rounded-2xl bg-secondary/20 h-12 w-12">
            <SettingsIcon className="w-5 h-5 text-muted-foreground" />
          </Button>
        </Link>
      </header>

      {/* Profile Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-secondary/20 border border-border/50 rounded-[2.5rem] p-8 mb-8 overflow-hidden glow-blue"
      >
        <div className="absolute top-0 right-0 p-4">
            <ShieldCheck className="w-8 h-8 text-primary/20" />
        </div>
        
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-24 h-24 bg-primary/20 border-2 border-primary rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.3)]">
            <UserIcon className="w-12 h-12 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter italic">
              {user.displayName || "Pilot Trainee"}
            </h2>
            <div className="flex items-center gap-2 text-muted-foreground mt-1 justify-center">
              <Mail className="w-4 h-4" />
              <span className="text-xs font-medium">{user.email}</span>
            </div>
          </div>
          <div className="px-4 py-1.5 bg-primary rounded-full text-[10px] font-black uppercase tracking-widest text-black italic">
            Certified Novice
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center justify-between bg-secondary/10 border border-border/30 rounded-3xl p-5 hover:bg-secondary/20 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-secondary/40 flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </span>
            </div>
            <span className="text-xl font-black italic tracking-tighter">{stat.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="space-y-4">
        <Button 
          variant="destructive" 
          onClick={handleSignOut}
          className="w-full h-16 rounded-3xl text-sm font-black uppercase tracking-widest bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-destructive flex gap-3 italic"
        >
          <LogOut className="w-5 h-5" />
          Terminate Session
        </Button>
      </div>

      {/* Navigation Footer (Duplicate for consistency) */}
      <nav className="fixed bottom-6 left-6 right-6 h-16 bg-black/80 backdrop-blur-xl border border-border/50 rounded-3xl flex items-center justify-around px-4 glow-blue">
        <Link href="/">
          <Button variant="ghost" size="icon" className="text-muted-foreground/40">
             <Brain className="w-6 h-6" />
          </Button>
        </Link>
        <Link href="/profile">
          <Button variant="ghost" size="icon" className="text-primary scale-125">
             <UserIcon className="w-6 h-6" />
          </Button>
        </Link>
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="text-muted-foreground/40">
             <ShieldCheck className="w-6 h-6" />
          </Button>
        </Link>
      </nav>
    </div>
  );
}
