
"use client";

import { BottomNav } from "@/components/BottomNav";
import { Trophy, Star, Target, ShieldCheck, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

const QUESTS = [
  { id: 1, title: "Function Master", desc: "Write 10 functions without errors", progress: 70, icon: Star, color: "text-yellow-500" },
  { id: 2, title: "Streak Warrior", desc: "Maintain a 14-day streak", progress: 85, icon: Flame, color: "text-orange-500" },
  { id: 3, title: "Code Guard", desc: "Solve 5 Cybersecurity challenges", progress: 20, icon: ShieldCheck, color: "text-red-500" },
  { id: 4, title: "Speed Demon", desc: "Complete an exercise in under 60s", progress: 100, icon: Target, color: "text-blue-500" },
];

export default function QuestsPage() {
  return (
    <div className="pb-32 min-h-screen p-6">
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="text-yellow-500 w-6 h-6" />
          <h1 className="font-headline text-2xl font-bold tracking-tight uppercase">Active Quests</h1>
        </div>
        <p className="text-sm text-muted-foreground">Complete challenges to earn XP and unlock exclusive badges.</p>
      </header>

      <div className="space-y-4">
        {QUESTS.map((quest, idx) => (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={quest.id}
            className="bg-card border border-border p-4 rounded-2xl relative overflow-hidden group"
          >
            {quest.progress === 100 && (
              <div className="absolute top-0 right-0 bg-accent px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase text-accent-foreground">
                Completed
              </div>
            )}
            <div className="flex gap-4 items-center mb-3">
              <div className={`p-3 rounded-xl bg-secondary ${quest.color}`}>
                <quest.icon size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm">{quest.title}</h3>
                <p className="text-xs text-muted-foreground">{quest.desc}</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                <span>Progress</span>
                <span>{quest.progress}%</span>
              </div>
              <Progress value={quest.progress} className="h-1.5" />
            </div>
          </motion.div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
