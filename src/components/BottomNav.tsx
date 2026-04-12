
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Network, BrainCircuit, Target, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { icon: Network, label: "Learn", href: "/" },
    { icon: Target, label: "Practice", href: "/practice" },
    { icon: BrainCircuit, label: "Quests", href: "/quests" },
    { icon: User, label: "Profile", href: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-t border-border px-6 py-3 flex justify-between items-center">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300",
              isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className={cn("w-6 h-6", isActive && "glow-blue")} />
            <span className="text-[10px] font-medium tracking-wide uppercase">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
