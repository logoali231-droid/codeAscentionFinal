"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { BrainCircuit, Cpu, Sparkles, Wand2, Terminal, Code2, ChevronLeft, RotateCcw, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { generateStructuredAIOutput, clearAiCache } from "@/ai/client-ai";
import { findAllLocalChallenges, type LocalChallenge } from "@/ai/local-challenges";

interface CustomizedChallenge {
  challengeTitle: string;
  challengeDescription: string;
  problemStatement: string;
  inputExamples: string[];
  outputExamples: string[];
  hints?: string[];
}

export default function PracticePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [weakness, setWeakness] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [retryStatus, setRetryStatus] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<CustomizedChallenge | null>(null);
  const [source, setSource] = useState<"local" | "cloud" | null>(null);

  const handleGenerate = async () => {
    if (!weakness.trim()) {
      toast({ title: "Tell AI what to focus on!", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setRetryStatus(null);
    setChallenge(null);
    setSource(null);

    // STEP 1: Always try local database FIRST (instant, free, offline)
    const localMatches = findAllLocalChallenges(weakness);
    if (localMatches.length > 0) {
      const picked = localMatches[Math.floor(Math.random() * localMatches.length)];
      setChallenge({
        challengeTitle: picked.challengeTitle,
        challengeDescription: picked.challengeDescription,
        problemStatement: picked.problemStatement,
        inputExamples: picked.inputExamples,
        outputExamples: picked.outputExamples,
        hints: picked.hints,
      });
      setSource("local");
      setIsGenerating(false);
      setRetryStatus(null);
      return;
    }

    // STEP 2: If no local match, try Gemini cloud as bonus
    try {
      setRetryStatus("Searching Cloud AI...");
      const prompt = `You are an experienced programming instructor. Generate a coding challenge targeting: ${weakness}.
The challenge should be solvable in JavaScript with clear examples.
Return ONLY valid JSON:
{
  "challengeTitle": "string",
  "challengeDescription": "string",
  "problemStatement": "string",
  "inputExamples": ["string"],
  "outputExamples": ["string"],
  "hints": ["string"]
}`;

      const data = await generateStructuredAIOutput<CustomizedChallenge>(prompt, true);
      setChallenge(data);
      setSource("cloud");
    } catch (error: any) {
      // STEP 3: If cloud also fails, fall back to a random local challenge
      console.warn("Cloud AI failed, serving random local challenge:", error.message);
      const fallback = localMatches[0] || findAllLocalChallenges("recursion")[0];
      setChallenge({
        challengeTitle: fallback.challengeTitle,
        challengeDescription: fallback.challengeDescription,
        problemStatement: fallback.problemStatement,
        inputExamples: fallback.inputExamples,
        outputExamples: fallback.outputExamples,
        hints: fallback.hints,
      });
      setSource("local");
      toast({ 
        title: "Using Local Brain", 
        description: "Cloud AI is busy. Here's a challenge from your device's local intelligence!",
      });
    } finally {
      setIsGenerating(false);
      setRetryStatus(null);
    }
  };

  const handleResetAI = () => {
    clearAiCache();
    setChallenge(null);
    setSource(null);
    toast({ title: "AI Environment Reset", description: "Memory cleared." });
  };

  return (
    <div className="pb-32 min-h-screen p-6">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-headline text-2xl font-bold tracking-tight">AI TRAINING LAB</h1>
            <p className="text-sm text-muted-foreground">Target specific weaknesses with real-time generated exercises.</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleResetAI} className="gap-2 text-[10px] uppercase font-bold tracking-widest border-primary/20 hover:bg-primary/10">
          <RotateCcw className="w-3 h-3" /> Reset AI
        </Button>
      </header>

      <div className="space-y-8">
        <section className="bg-card border-2 border-primary/20 rounded-2xl p-6 glow-blue">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-accent" />
            <h3 className="font-headline font-bold text-lg uppercase tracking-wider">Configure Agent</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                What do you want to master?
              </label>
              <Input
                value={weakness}
                onChange={(e) => setWeakness(e.target.value)}
                placeholder="e.g. recursion, array methods, async await"
                className="bg-background border-border focus:border-primary"
              />
            </div>
            
            <Button 
              className="w-full h-12 glow-blue font-bold uppercase tracking-widest gap-2"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                  <BrainCircuit className="w-5 h-5" />
                </motion.div>
              ) : (
                <Wand2 className="w-5 h-5" />
              )}
              {isGenerating ? (retryStatus || "Synthesizing...") : "Initiate AI Forge"}
            </Button>
          </div>
        </section>

        <AnimatePresence>
          {challenge && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Source Badge */}
              <div className="flex justify-center">
                <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                  source === 'local' 
                    ? 'bg-accent/10 border-accent/30 text-accent' 
                    : 'bg-primary/10 border-primary/30 text-primary'
                }`}>
                  {source === 'local' ? '⚡ Local Brain — Instant & Free' : '☁️ Cloud AI — Gemini'}
                </span>
              </div>

              <Card className="border-accent/40 bg-accent/5 overflow-hidden">
                <CardHeader className="border-b border-accent/20">
                  <div className="flex justify-between items-center">
                    <CardTitle className="font-headline text-xl text-accent uppercase tracking-tight">
                      {challenge.challengeTitle}
                    </CardTitle>
                    <Terminal className="text-accent w-5 h-5" />
                  </div>
                  <CardDescription className="text-foreground/80 font-medium">
                    {challenge.challengeDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-accent uppercase tracking-widest mb-2">The Objective</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">{challenge.problemStatement}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-background/80 p-4 rounded-xl border border-border">
                      <h5 className="text-[10px] font-bold uppercase tracking-tighter text-primary mb-2">Input Examples</h5>
                      <div className="space-y-2">
                        {challenge.inputExamples.map((ex: string, i: number) => (
                          <code key={i} className="block text-[10px] font-code bg-secondary p-1 rounded">
                            {ex}
                          </code>
                        ))}
                      </div>
                    </div>
                    <div className="bg-background/80 p-4 rounded-xl border border-border">
                      <h5 className="text-[10px] font-bold uppercase tracking-tighter text-accent mb-2">Expected Outputs</h5>
                      <div className="space-y-2">
                        {challenge.outputExamples.map((ex: string, i: number) => (
                          <code key={i} className="block text-[10px] font-code bg-secondary p-1 rounded">
                            {ex}
                          </code>
                        ))}
                      </div>
                    </div>
                  </div>

                  {challenge.hints && challenge.hints.length > 0 && (
                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                      <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Code2 className="w-4 h-4" /> AI Tactical Hints
                      </h4>
                      <ul className="space-y-2">
                        {challenge.hints.map((hint: string, i: number) => (
                          <li key={i} className="text-xs text-muted-foreground flex gap-2">
                            <span className="text-primary font-bold">{i+1}.</span>
                            {hint}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button 
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold uppercase tracking-widest glow-green"
                    onClick={() => toast({ title: "Loading Editor..." })}
                  >
                    Enter Training Room
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Static Content for Empty State */}
        {!challenge && !isGenerating && (
          <div className="flex flex-col items-center justify-center py-12 opacity-30 text-center">
            <BrainCircuit size={100} className="mb-4" />
            <p className="font-headline font-bold uppercase tracking-widest">Awaiting Command</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
