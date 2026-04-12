
"use client";

import { BottomNav } from "@/components/BottomNav";
import { User, Settings, Award, History, TrendingUp, Github } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ProfilePage() {
  const stats = [
    { label: "Total XP", value: "14,502", icon: Star },
    { label: "Rank", value: "#42", icon: TrendingUp },
    { label: "Badges", value: "12", icon: Award },
  ];

  return (
    <div className="pb-32 min-h-screen">
      <header className="p-8 bg-gradient-to-b from-primary/20 to-transparent flex flex-col items-center gap-4">
        <div className="relative">
          <Avatar className="w-24 h-24 border-4 border-primary glow-blue">
            <AvatarImage src="https://picsum.photos/seed/user123/200" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-2 -right-2 bg-accent rounded-full p-2 border-2 border-background">
            <Flame className="w-4 h-4 text-white fill-white" />
          </div>
        </div>
        <div className="text-center">
          <h1 className="font-headline text-2xl font-bold">John Doe</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Pro Developer • Level 18</p>
        </div>
        <div className="flex gap-2 w-full mt-4">
          <Link href="/settings" className="flex-1 w-full flex">
            <Button variant="secondary" className="flex-1 gap-2 font-bold uppercase text-[10px] tracking-widest w-full">
              <Settings className="w-3 h-3" /> Configure
            </Button>
          </Link>
          <Button variant="outline" className="flex-1 gap-2 font-bold uppercase text-[10px] tracking-widest">
            <Github className="w-3 h-3" /> Connect
          </Button>
        </div>
      </header>

      <main className="px-6 space-y-6">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, idx) => (
            <Card key={idx} className="bg-card border-border overflow-hidden">
              <CardContent className="p-3 text-center space-y-1">
                <stat.icon className="w-4 h-4 mx-auto text-primary" />
                <div className="text-xs font-bold">{stat.value}</div>
                <div className="text-[8px] text-muted-foreground uppercase font-bold tracking-tighter">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <section>
          <h3 className="font-headline font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
            <History className="w-4 h-4 text-primary" /> Recent Achievements
          </h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 items-center bg-secondary/50 p-4 rounded-xl border border-border">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Award className="text-primary w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Loop Master {i}</h4>
                  <p className="text-xs text-muted-foreground">Mastered the art of iterative logic.</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

import { Flame, Star } from "lucide-react";
