
"use client";

import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { BrainCircuit, Cpu, Sparkles, Wand2, Terminal, Code2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { getClientAiModel } from "@/ai/client-ai";

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
  const [weakness, setWeakness] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [challenge, setChallenge] = useState<CustomizedChallenge | null>(null);

  const handleGenerate = async () => {
    if (!weakness.trim()) {
      toast({ title: "Tell AI what to focus on!", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setChallenge(null);

    try {
      const model = getClientAiModel();
      const prompt = `You are an experienced programming instructor. Your goal is to create a customized coding challenge for a user.

Generate a coding challenge that specifically targets the following weaknesses identified in the user's performance: ${weakness}.

The challenge should primarily be solvable using the JavaScript programming language.

Ensure the challenge has a clear problem statement, provides concrete input examples, and their corresponding expected outputs. Optionally, provide some helpful hints.

Return ONLY a valid JSON object with the following structure:
{
  "challengeTitle": "string",
  "challengeDescription": "string",
  "problemStatement": "string",
  "inputExamples": ["string"],
  "outputExamples": ["string"],
  "hints": ["string"]
}
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const data = JSON.parse(response.text());
      setChallenge(data);
    } catch (error: any) {
      console.error("Practice generation error:", error);
      toast({ 
        title: error.message?.includes("quota") ? "Quota Limit Reached" : "AI Generation Failed", 
        description: error.message?.includes("quota") 
          ? "You've hit your free tier limit. Please wait a moment or check your API key settings." 
          : (error.message || "Ensure your API key is correctly configured in .env.local"), 
        variant: "destructive" 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="pb-32 min-h-screen p-6">
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Cpu className="text-primary w-5 h-5" />
          <h1 className="font-headline text-2xl font-bold tracking-tight">AI TRAINING LAB</h1>
        </div>
        <p className="text-sm text-muted-foreground">Target specific weaknesses with real-time generated exercises.</p>
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
              {isGenerating ? "Synthesizing Challenge..." : "Initiate AI Forge"}
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
