
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Send, Sparkles, CheckCircle2, AlertCircle, Zap, Rocket, BrainCircuit, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { generateStructuredAIOutput } from "@/ai/client-ai";
import { motion, AnimatePresence } from "framer-motion";
import { updateDifficulty } from "@/ai/difficulty";
import type { AdvancedFeedback } from "@/ai/types";

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
  const user = { uid: "local-user-1" };
  const isUserLoading = false;

  const [exercise, setExercise] = useState<RemedialExercise | null>(null);
  const [code, setCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(true);
  const [retryStatus, setRetryStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evalRetryStatus, setEvalRetryStatus] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<RemedialFeedback | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    async function generateExercise() {
      setIsGenerating(true);
      setRetryStatus(null);
      try {
        const prompt = `You are a world-class programming tutor. Create a "Remedial Mission" that gives a learner a confidence-building coding exercise focused on core fundamentals. Keep the mission clear, supportive, and suitable for someone who may need extra practice.

Return ONLY a valid JSON object:
{
  "title": "string (Short, cool mission title)",
  "description": "string (Clear instructions)",
  "starterCode": "string (Relevant boilerplate)",
  "language": "string (e.g. JavaScript, Python)"
}`;

        const generated = await generateStructuredAIOutput<RemedialExercise>(prompt);
        setExercise(generated);
        setCode(generated.starterCode);
      } catch (error: any) {
        console.error("Generation error:", error);
        toast({ title: "Failed to synthesize mission.", variant: "destructive" });
      } finally {
        setIsGenerating(false);
        setRetryStatus(null);
      }
    }

    if (!isUserLoading) {
      generateExercise();
    }
  }, [isUserLoading]);

 const handleSubmit = async () => {
  if (!code.trim() || !exercise) return;

  setIsSubmitting(true);
  setFeedback(null);
  setEvalRetryStatus(null);

  try {
    const prompt = `You are an elite programming mentor.

Evaluate the student's solution with deeper analysis.

MISSION: ${exercise.title}
DESCRIPTION: ${exercise.description}

CODE:
\`\`\`${exercise.language}
${code}
\`\`\`

Return ONLY valid JSON:

{
  "isCorrect": boolean,
  "score": number,
  "level": "poor" | "ok" | "good" | "excellent",
  "feedbackSummary": "short explanation",

  "analysis": {
    "logic": number,
    "readability": number,
    "bestPractices": number
  },

  "errorsFound": [
    { "line": number, "message": "string", "explanation": "string" }
  ],

  "suggestions": [
    { "type": "logic" | "style", "message": "string", "explanation": "string" }
  ]
}`;

    const evalResult = await generateStructuredAIOutput<AdvancedFeedback>(prompt);

    // 🧠 proteção contra resposta inválida da IA
    const score = typeof evalResult.score === "number" ? evalResult.score : 0;

    // 🔥 dificuldade adaptativa REAL
    const isStrong = score >= 70;
    const newLevel = updateDifficulty(isStrong);

    console.log("New difficulty level:", newLevel);

    // 🔥 UI
    setFeedback(evalResult);

    // 🔥 feedback
    if (evalResult.isCorrect) {
      toast({ title: "Remedial Mission Accomplished!" });
    } else {
      toast({ title: "Keep going — you're close.", variant: "destructive" });
    }

  } catch (error: any) {
    console.error(error);
    toast({ title: "Evaluation failed.", variant: "destructive" });
  } finally {
    setIsSubmitting(false);
    setEvalRetryStatus(null);
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
