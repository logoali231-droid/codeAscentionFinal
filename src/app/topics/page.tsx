"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { localDb, LocalPilotProfile } from "@/lib/local-db";
import { 
  Rocket, 
  Terminal, 
  Code2, 
  Cpu, 
  Braces,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const TOPICS = [
  { id: "python", name: "Python", icon: Terminal, description: "Data, scripting, and backend systems.", color: "text-blue-400", bg: "bg-blue-400/10" },
  { id: "javascript", name: "JavaScript", icon: Braces, description: "Frontend interfaces and dynamic web logic.", color: "text-yellow-400", bg: "bg-yellow-400/10" },
  { id: "rust", name: "Rust", icon: Cpu, description: "High-performance systems and memory safety.", color: "text-orange-500", bg: "bg-orange-500/10" },
  { id: "cplusplus", name: "C++", icon: Code2, description: "Game engines and hyper-optimized computations.", color: "text-indigo-400", bg: "bg-indigo-400/10" },
];

export default function TopicsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<LocalPilotProfile | null>(null);

  useEffect(() => {
    const prof = localDb.getProfile();
    if (!prof) {
      router.replace("/login");
    } else {
      setProfile(prof);
    }
  }, [router]);

  const selectTopic = (topicId: string) => {
    localDb.updateProfileTopic(topicId);
    router.push("/");
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24 bg-[radial-gradient(circle_at_top_right,_var(--color-primary)_0%,_transparent_15%)]">
      <header className="mb-12 mt-6">
        <h1 className="text-3xl font-black uppercase tracking-tighter italic mb-2">
          Select Training Path
        </h1>
        <p className="text-muted-foreground text-sm">
          Initialize your LocalBrain targeting systems for a specific language matrix.
        </p>
      </header>

      <main className="space-y-4">
        {TOPICS.map((topic, i) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <button
              onClick={() => selectTopic(topic.id)}
              className="w-full text-left peer group relative bg-secondary/20 border-2 border-border hover:border-primary/50 shadow-lg hover:shadow-primary/10 rounded-3xl p-5 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${topic.bg}`}>
                    <topic.icon className={`w-6 h-6 ${topic.color}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight uppercase italic">{topic.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{topic.description}</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-primary/10 text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </div>
            </button>
          </motion.div>
        ))}
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-6 pointer-events-none">
        <p className="text-center text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-50 flex items-center justify-center gap-2">
          <Rocket className="w-3 h-3" />
          Offline Module Active
        </p>
      </div>
    </div>
  );
}
