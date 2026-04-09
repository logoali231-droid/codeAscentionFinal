"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Rocket, 
  BrainCircuit, 
  Shield, 
  Layout, 
  ChevronRight,
  User as UserIcon,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { localDb, LocalPilotProfile } from "@/lib/local-db";
import { motion } from "framer-motion";

export default function HomePage() {
  const [profile, setProfile] = useState<LocalPilotProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    const prof = localDb.getProfile();
    if (!prof) {
      router.replace("/login");
    } else if (!prof.selectedTopic) {
      router.replace("/topics");
    } else {
      setProfile(prof);
    }
  }, [router]);

  if (!profile || !profile.selectedTopic) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Dynamic Levels based on Language Selection
  const LEVELS = [
    { level: 1, title: "Syntax & Variables", description: "The foundation logic gates." },
    { level: 2, title: "Control Flow", description: "If/Else routing protocols." },
    { level: 3, title: "Loops & Iterables", description: "Sustained execution cycles." },
    { level: 4, title: "Functions & Scope", description: "Modular operation grouping." },
    { level: 5, title: "Data Structures", description: "Advanced memory management." }
  ];

  const getLanguageName = (topicId: string) => {
    const map: Record<string, string> = {
      python: "Python",
      javascript: "JavaScript",
      rust: "Rust",
      cplusplus: "C++"
    };
    return map[topicId] || topicId;
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24 bg-[radial-gradient(circle_at_top_right,_var(--color-primary)_0%,_transparent_15%)]">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-12 mt-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-secondary/40 border border-border rounded-2xl flex items-center justify-center glow-blue">
            <UserIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter italic">
              {profile.displayName || "Pilot"}
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-none">
              Level 1 Trainee
            </p>
          </div>
        </div>
        <Link href="/topics">
          <Button 
            variant="ghost" 
            size="sm" 
            className="rounded-xl bg-secondary/20 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors text-[10px] uppercase font-bold tracking-widest h-8"
          >
            Change Path
          </Button>
        </Link>
      </header>

      {/* Mastery Tree Section */}
      <main className="space-y-12 max-w-lg mx-auto">
        <div className="text-center space-y-2 mb-8">
           <h2 className="text-2xl font-black uppercase tracking-tighter italic">Dynamic Curriculum</h2>
           <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Active Module: <span className="text-primary font-bold">{getLanguageName(profile.selectedTopic)}</span>
           </p>
        </div>

        <div className="relative">
          <div className="space-y-6 relative">
            {LEVELS.map((level, index) => (
              <motion.div
                key={level.level}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Dynamically route to ExerciseClient, passing the language and level */}
                <Link href={`/exercise/${profile.selectedTopic}_lvl_${level.level}`}>
                  <div className={`peer group relative bg-secondary/20 border-2 rounded-3xl p-5 hover:scale-[1.02] active:scale-[0.98] transition-all
                    border-primary/30 hover:border-primary shadow-lg hover:shadow-primary/10`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[8px] font-black uppercase bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                            Phase {level.level}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg leading-tight uppercase italic">{level.title}</h3>
                        <p className="text-xs text-muted-foreground">{level.description}</p>
                      </div>
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors bg-primary/10 text-primary group-hover:bg-primary group-hover:text-black`}>
                        <ChevronRight className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Vertical Connector Line - Only if not the last item */}
                {index < LEVELS.length - 1 && (
                  <div className="absolute left-[30px] bottom-[-24px] w-0.5 h-6 bg-border/50 -z-10" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Navigation Footer */}
      <nav className="fixed bottom-6 left-6 right-6 h-16 bg-black/80 backdrop-blur-xl border border-border/50 rounded-3xl flex items-center justify-around px-4 glow-blue">
        <Link href="/">
          <Button variant="ghost" size="icon" className="text-primary scale-125">
             <Layout className="w-6 h-6" />
          </Button>
        </Link>
        <Link href="/profile">
          <Button variant="ghost" size="icon" className="text-muted-foreground/40">
             <BrainCircuit className="w-6 h-6" />
          </Button>
        </Link>
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="text-muted-foreground/40">
             <Shield className="w-6 h-6" />
          </Button>
        </Link>
      </nav>
    </div>
  );
}
