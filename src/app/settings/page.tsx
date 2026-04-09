"use client";

import { localDb, LocalPilotProfile } from "@/lib/local-db";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  ChevronLeft,
  Bell,
  Moon,
  Smartphone,
  Globe,
  Database,
  Lock,
  ChevronRight,
  ShieldAlert,
  HelpCircle,
  Cpu,
  User as UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<LocalPilotProfile | null>(null);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    const profile = localDb.getProfile();
    if (!profile) {
      router.replace("/login");
    } else {
      setUser(profile);
    }
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const settingsGroups = [
    {
      title: "System",
      items: [
        { label: "Neural Notifications", icon: Bell, action: "toggle", state: notifications, setState: setNotifications },
        { label: "Dark Interface", icon: Moon, action: "static", value: "Always On" },
        { label: "Mobile Sync", icon: Smartphone, action: "link" },
      ]
    },
    {
      title: "Security",
      items: [
        { label: "Encryption Key", icon: Lock, action: "link" },
        { label: "Regional Server", icon: Globe, action: "static", value: "Auto-Select" },
        { label: "Data Management", icon: Database, action: "link" },
      ]
    },
    {
      title: "Support",
      items: [
        { label: "Manuals & Help", icon: HelpCircle, action: "link" },
        { label: "System Status", icon: Cpu, action: "static", value: "Nominal" },
        { label: "Emergency Reset", icon: ShieldAlert, action: "link", color: "text-destructive" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24 bg-[radial-gradient(circle_at_top_right,_var(--color-primary)_0%,_transparent_15%)]">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <Link href="/profile">
          <Button variant="ghost" size="icon" className="rounded-2xl bg-secondary/20 h-12 w-12">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <h1 className="text-xl font-black uppercase tracking-tighter italic">Protocols</h1>
        <div className="w-12" /> {/* Spacer */}
      </header>

      {/* Settings List */}
      <div className="space-y-8">
        {settingsGroups.map((group, groupIndex) => (
          <div key={group.title} className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4">
              {group.title}
            </h3>
            <div className="bg-secondary/10 border border-border/30 rounded-[2rem] overflow-hidden">
              {group.items.map((item, itemIndex) => (
                <div 
                  key={item.label}
                  className={`flex items-center justify-between p-5 hover:bg-secondary/20 transition-colors cursor-pointer
                    ${itemIndex !== group.items.length - 1 ? 'border-b border-border/10' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-secondary/30 flex items-center justify-center">
                      <item.icon className={`w-5 h-5 ${(item as any).color || 'text-primary/70'}`} />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-tight italic">{item.label}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {item.action === "static" && (
                      <span className="text-[10px] font-black uppercase text-muted-foreground bg-secondary/30 px-3 py-1 rounded-full">
                        {item.value}
                      </span>
                    )}
                    {item.action === "toggle" && (
                      <div 
                        onClick={() => (item as any).setState?.(!(item as any).state)}
                        className={`w-10 h-6 rounded-full transition-colors relative ${(item as any).state ? 'bg-primary' : 'bg-muted/30'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${(item as any).state ? 'left-5' : 'left-1'}`} />
                      </div>
                    )}
                    {item.action === "link" && (
                      <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="text-center mt-12 text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-30">
        Code Ascention v1.0.4 roryed-restored
      </div>

      {/* Navigation Footer */}
      <nav className="fixed bottom-6 left-6 right-6 h-16 bg-black/80 backdrop-blur-xl border border-border/50 rounded-3xl flex items-center justify-around px-4 glow-blue">
        <Link href="/">
          <Button variant="ghost" size="icon" className="text-muted-foreground/40">
             <Cpu className="w-6 h-6" />
          </Button>
        </Link>
        <Link href="/profile">
          <Button variant="ghost" size="icon" className="text-muted-foreground/40">
             <UserIcon className="w-6 h-6" />
          </Button>
        </Link>
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="text-primary scale-125">
             <HelpCircle className="w-6 h-6" />
          </Button>
        </Link>
      </nav>
    </div>
  );
}
