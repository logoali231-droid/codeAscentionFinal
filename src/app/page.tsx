
"use client";

import { useState, useEffect } from "react";
import { SkillNode } from "@/components/SkillNode";
import { BottomNav } from "@/components/BottomNav";
import { Rocket, Zap, Crown, ChevronDown, BrainCircuit, LogOut, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { COURSES } from "@/app/lib/courses-data";
import { useUser, useAuth } from "@/firebase/provider";
import { signOutUser } from "@/firebase/auth";
import { useRouter } from "next/navigation";
import { getPastUserErrorsSummary, getUserPacingMetrics } from "@/lib/user-progress";
import { useFirestore } from "@/firebase";
import { generateStructuredAIOutput } from "@/ai/client-ai";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
export default function Home() {
  const [currentCourse, setCurrentCourse] = useState(COURSES[0]);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const db = useFirestore();

  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [hasRecentStruggles, setHasRecentStruggles] = useState(false);
  const [isInsightLoading, setIsInsightLoading] = useState(false);

  useEffect(() => {
    async function loadAiInsights() {
      if (!user || !db) return;
      setIsInsightLoading(true);
      try {
        const errors = await getPastUserErrorsSummary(db, user.uid);
        if (errors) {
          setHasRecentStruggles(true);
          const pacing = await getUserPacingMetrics(db, user.uid);
          
          const prompt = `You are an encouraging AI coding coach. Based on these recent user errors and their learning pace, provide a brief (1-2 sentences), highly motivating insight on what they should focus on next.
          
ERRORS: ${errors}
PACING: ${pacing}

Return ONLY a valid JSON object:
{
  "insight": "string"
}`;
          
          const res = await generateStructuredAIOutput<{insight: string}>(prompt, undefined, true);
          setAiInsight(res.insight);
        }
      } catch (err: any) {
        console.error("AI Insight error:", err);
      } finally {
        setIsInsightLoading(false);
      }
    }
    loadAiInsights();
  }, [user, db]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace("/login");
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return <div className="min-h-screen bg-background flex flex-col items-center justify-center glow-blue text-primary animate-pulse"><Rocket className="w-12 h-12" /></div>;
  }

  return (
    <div className="pb-24 min-h-screen">
      {/* Header with Path Switcher */}
      <header className="p-6 sticky top-0 z-40 bg-background/80 backdrop-blur-md flex justify-between items-center border-b border-border">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0 hover:bg-transparent flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center glow-blue">
                  <Rocket className="text-white w-6 h-6" />
                </div>
                <div className="text-left">
                  <h1 className="font-headline font-bold text-lg leading-tight tracking-tight flex items-center gap-1">
                    {currentCourse.title.toUpperCase()}
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </h1>
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-accent fill-accent" />
                    <span className="text-[10px] text-accent font-bold uppercase tracking-tighter">12 Day Streak</span>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-card border-border">
              {COURSES.map((course) => (
                <DropdownMenuItem 
                  key={course.id} 
                  onClick={() => setCurrentCourse(course)}
                  className="flex items-center gap-3 p-3 focus:bg-primary/10 cursor-pointer"
                >
                  <div className={`w-2 h-2 rounded-full bg-${course.color}-500`} />
                  <span className="font-bold text-xs uppercase tracking-widest">{course.title}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-full border border-border">
            <Crown className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-bold">1.2k</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => auth && signOutUser(auth)}
            className="hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* AI Tutor Insight */}
      <AnimatePresence>
        {aiInsight && (
          <motion.section 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="px-6 mb-6"
          >
            <div className="bg-primary/10 border-2 border-primary/30 rounded-2xl p-4 flex gap-4 items-center glow-blue">
              <div className="bg-primary p-2 rounded-lg">
                <BrainCircuit className="text-white w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Coach's Strategic Note</h4>
                <p className="text-sm font-medium leading-tight italic">{aiInsight}</p>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Adaptive Remedial Card */}
      <AnimatePresence>
        {hasRecentStruggles && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 mb-8"
          >
            <div 
              onClick={() => router.push("/exercise/remedial")}
              className="bg-accent/10 border-2 border-accent/40 rounded-2xl p-5 cursor-pointer hover:bg-accent/20 transition-all group overflow-hidden relative"
            >
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                <Zap size={100} className="text-accent" />
              </div>
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                <h3 className="font-headline font-bold text-lg text-accent tracking-tighter uppercase">Special Remedial Mission</h3>
              </div>
              <p className="text-sm text-foreground/80 mb-4 max-w-[80%] italic">
                Our AI detected some hurdles in your recent sessions. We've synthesized a specific training exercise to help you overcome them.
              </p>
              <Button size="sm" className="bg-accent text-accent-foreground font-bold uppercase text-[10px] tracking-widest gap-2">
                Launch Mission <Rocket className="w-3 h-3" />
              </Button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Mastery Tree */}
      <main className="px-6 pt-4">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentCourse.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center gap-16 relative"
          >
            {/* Path Line */}
            <div className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary/50 to-muted z-0 rounded-full" />
            
            {currentCourse.skills.map((skill, index) => (
              <div 
                key={skill.id} 
                className="z-10"
                style={{
                  marginLeft: index % 2 === 0 ? '40px' : '-40px'
                }}
              >
                <SkillNode
                  index={index}
                  id={skill.id}
                  title={skill.title}
                  status={skill.status}
                  type={skill.type}
                />
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
        
        {/* Motivational Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16 bg-card border-2 border-primary/20 rounded-2xl p-6 glow-blue relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <BrainCircuit size={80} />
          </div>
          <h3 className="font-headline font-bold text-xl mb-2">Next Challenge</h3>
          <p className="text-sm text-muted-foreground mb-4">
            You're close to mastering <span className="text-primary font-bold">this level</span>. Complete 2 more exercises to unlock the next tier.
          </p>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary w-[65%] glow-blue transition-all duration-1000" />
          </div>
          <div className="mt-2 text-[10px] text-muted-foreground text-right font-bold uppercase tracking-widest">
            65% Complete
          </div>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}
