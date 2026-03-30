
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Send, Sparkles, CheckCircle2, AlertCircle, Zap, Rocket, BrainCircuit, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { getClientAiModel } from "@/ai/client-ai";
import { motion, AnimatePresence } from "framer-motion";
import { useUser, useFirestore } from "@/firebase";
import { collection, serverTimestamp, addDoc } from "firebase/firestore";
import { getPastUserErrorsSummary, getUserPacingMetrics } from "@/lib/user-progress";

interface RemedialExercise {
  title: string;
  description: string;
  starterCode: string;
  language: string;
}

interface RemedialFeedback {
  isCorrect: boolean;
  feedbackSummary: string;
  errorsFound: Array<{ line: number; message: string; explanation: string }>;
  suggestions: Array<{ type: "logic" | "style"; message: string; explanation: string }>;
}

export default function RemedialClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const [exercise, setExercise] = useState<RemedialExercise | null>(null);
  const [code, setCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<RemedialFeedback | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    async function generateExercise() {
      if (!user || !db) return;
      setIsGenerating(true);
      try {
        const errors = await getPastUserErrorsSummary(db, user.uid);
        const pacing = await getUserPacingMetrics(db, user.uid);

        const model = getClientAiModel();
        const prompt = `You are a world-class programming tutor. You are creating a "Remedial Mission" for a student who has been struggling with specific concepts.
        
USER ERROR HISTORY:
${errors}

USER PACING:
${pacing}

Based on these errors, generate a NEW, targeted coding exercise that specifically addresses their misunderstandings. 
It should be simple enough to build confidence but technical enough to fix the error pattern.

Return ONLY a valid JSON object:
{
  "title": "string (Short, cool mission title)",
  "description": "string (Clear instructions)",
  "starterCode": "string (Relevant boilerplate)",
  "language": "string (e.g. JavaScript, Python)"
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const generated = JSON.parse(response.text()) as RemedialExercise;
        setExercise(generated);
        setCode(generated.starterCode);
      } catch (error: any) {
        console.error("Generation error:", error);
        toast({ title: "Failed to synthesize mission.", variant: "destructive" });
      } finally {
        setIsGenerating(false);
      }
    }

    if (!isUserLoading && user) {
      generateExercise();
    } else if (!isUserLoading && !user) {
      router.replace("/login");
    }
  }, [user, isUserLoading, db, router]);

  const handleSubmit = async () => {
    if (!code.trim() || !exercise) return;
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const model = getClientAiModel();
      const prompt = `Evaluate this student's response to the Remedial Mission.
      
MISSION: ${exercise.title}
DESCRIPTION: ${exercise.description}
SUBMITTED CODE:
\`\`\`${exercise.language}
${code}
\`\`\`

Return ONLY a valid JSON object:
{
  "isCorrect": boolean,
  "feedbackSummary": "string",
  "errorsFound": [{ "line": number, "message": "string", "explanation": "string" }],
  "suggestions": [{ "type": "logic" | "style", "message": "string", "explanation": "string" }]
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const evalResult = JSON.parse(response.text()) as RemedialFeedback;
      setFeedback(evalResult);

      if (evalResult.isCorrect && user && db) {
        // Record as "Extra Practice" (Option B)
        const attemptRef = collection(db, "users", user.uid, "exerciseAttempts");
        await addDoc(attemptRef, {
          userId: user.uid,
          exerciseId: "remedial_" + Date.now(),
          isCorrect: true,
          type: "remedial",
          submittedAt: serverTimestamp(),
        });
        toast({ title: "Remedial Mission Accomplished!" });
      }
    } catch (error: any) {
      toast({ title: "Evaluation failed.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isGenerating || isUserLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-6">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
          <BrainCircuit className="w-16 h-16 text-accent glow-blue" />
        </motion.div>
        <div>
          <h2 className="font-headline text-2xl font-bold text-accent uppercase tracking-tighter">Synthesizing Mission...</h2>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-2">
            AI is analyzing your recent hurdles to create a tailored training exercise.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <header className="p-4 flex items-center gap-4 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Personalized Remedial Mission</span>
          </div>
          <h1 className="font-headline font-bold text-sm truncate">{exercise?.title}</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
        <section className="bg-accent/5 border-2 border-accent/20 rounded-2xl p-5 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5"><Zap size={60} /></div>
             <p className="text-sm leading-relaxed relative z-10">{exercise?.description}</p>
        </section>

        <section className="space-y-2">
           <div className="flex justify-between items-center text-xs font-code text-muted-foreground">
             <span>{exercise?.language} Editor</span>
           </div>
           <Textarea
             value={code}
             onChange={(e) => setCode(e.target.value)}
             className="font-code min-h-[300px] bg-card border-2 border-border focus:border-accent transition-all resize-none text-sm p-4 glow-blue"
           />
        </section>

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-5 rounded-2xl border-2 ${feedback.isCorrect ? 'border-accent/40 bg-accent/5' : 'border-destructive/40 bg-destructive/5'}`}
            >
              <div className="flex items-start gap-3 mb-4">
                {feedback.isCorrect ? <CheckCircle2 className="w-6 h-6 text-accent" /> : <AlertCircle className="w-6 h-6 text-destructive" />}
                <div>
                  <h4 className={`font-bold ${feedback.isCorrect ? 'text-accent' : 'text-destructive'}`}>
                    {feedback.isCorrect ? "MISSION SUCCESS" : "CORRECTION REQUIRED"}
                  </h4>
                  <p className="text-sm">{feedback.feedbackSummary}</p>
                </div>
              </div>
              {feedback.isCorrect && (
                <Button className="w-full mt-4 bg-accent text-accent-foreground" onClick={() => router.push("/")}>
                  Back to Mastery Tree
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border flex gap-3">
        <Button className="flex-1 bg-accent hover:bg-accent/90 glow-blue gap-2 font-bold uppercase text-xs" onClick={handleSubmit} disabled={isSubmitting}>
           {isSubmitting ? "Evaluating..." : "Complete Mission"} <Rocket className="w-4 h-4" />
        </Button>
      </footer>
    </div>
  );
}
