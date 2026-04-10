"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Send, Zap, Rocket, CheckCircle2, AlertCircle, Lightbulb, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { safeParse, generateCustomMission, generateStructuredAIOutput } from "@/ai/client-ai";
import { motion, AnimatePresence } from "framer-motion";
import { localDb, LocalPilotProfile } from "@/lib/local-db";

interface FeedbackError {
  line?: number;
  message: string;
  explanation: string;
}

interface FeedbackSuggestion {
  type: 'readability' | 'performance' | 'best_practice' | 'optimization' | 'style' | 'logic' | 'syntax';
  message: string;
  explanation: string;
  codeSnippet?: string;
  severity: 'low' | 'medium' | 'high';
}

interface PersonalizedCodeFeedback {
  isCorrect: boolean;
  feedbackSummary: string;
  errorsFound: FeedbackError[];
  suggestions: FeedbackSuggestion[];
}

interface ExerciseClientProps {
  id: string; // Expected format: language_lvl_1 (e.g., python_lvl_1)
}

export default function ExerciseClient({ id }: ExerciseClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [profile, setProfile] = useState<LocalPilotProfile | null>(null);
  const [language, setLanguage] = useState("javascript");
  const [level, setLevel] = useState("1");

  const [mission, setMission] = useState<{ title: string, description: string, starterCode: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [downloadProgress, setDownloadProgress] = useState<string>("Initializing Core Engine...");
  const [noWebGpu, setNoWebGpu] = useState(false);

  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<PersonalizedCodeFeedback | null>(null);

  useEffect(() => {
    const prof = localDb.getProfile();
    if (!prof) {
      router.replace("/login");
      return;
    }
    setProfile(prof);

    // Parse ID
    const parts = id.split("_lvl_");
    if (parts.length === 2) {
      setLanguage(parts[0]);
      setLevel(parts[1]);
    }
  }, [id, router]);

  useEffect(() => {
    async function loadMission() {
      if (!language || !level) return;
      setIsGenerating(true);

      const attempts = localDb.getAttempts();
      const recentErrors = attempts
        .filter(a => !a.isCorrect && a.exerciseId.startsWith(language))
        .slice(-3)
        .map(a => a.feedbackSummary)
        .join(" | ");

      const handleProgress = (report: any) => {
        setDownloadProgress(report.text);
      };

      const newMission = await generateCustomMission(language, level, recentErrors, handleProgress);

      if (newMission) {
        setMission(newMission);
        setCode(newMission.starterCode);
      } else {
        console.error("Failed to generate mission. Using fallback.");
        setMission({
          title: "System Fallback Route",
          description: `Declare a variable to prove the compiler is active.`,
          starterCode: `// Write your ${language} code here\n`
        });
      }
      setIsGenerating(false);
    }

    async function loadMissionSafe() {
      try {
        await loadMission();
      } catch (err: any) {
        if (err?.message?.startsWith("NO_WEBGPU")) {
          setNoWebGpu(true);
        } else {
          console.error("engine failed", err);
        }
        setIsGenerating(false);
      }
    }

    if (profile) {
      loadMissionSafe();
    }
  }, [language, level, profile]);

  const handleSubmit = async () => {
    if (!code.trim() || !mission) {
      console.error("No code or mission");
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const attempts = localDb.getAttempts();
      const recentErrors = attempts
        .filter(a => !a.isCorrect && a.exerciseId.startsWith(language))
        .slice(-3)
        .map(a => a.feedbackSummary)
        .join(" | ");

      const prompt = `You are LocalBrain, an expert programming tutor. 
Analyze the following ${language} code for the mission: "${mission.title}".

OBJECTIVE: ${mission.description}

USER CODE:
\`\`\`${language}
${code}
\`\`\`

${recentErrors ? `HISTORY ALERT: The user has struggled with these patterns recently:
${recentErrors}
Pay special attention if they repeat these specific mistakes.` : "This is a clean slate. Help them build great habits."}`;

      const handleProgress = (report: any) => {
        setDownloadProgress(report.text);
      };

      const parsed = await generateStructuredAIOutput<PersonalizedCodeFeedback>(prompt, handleProgress);

      if (!parsed) throw new Error("LocalBrain could not structure the feedback.");

      setFeedback(parsed);

      // Save to Local DB
      localDb.saveAttempt({
        exerciseId: id,
        submittedCode: code,
        isCorrect: parsed.isCorrect,
        feedbackSummary: parsed.feedbackSummary,
        submittedAt: new Date().toISOString()
      });

      if (parsed.isCorrect) {
        localDb.saveProgress({
          lessonId: id,
          status: 'Completed',
          completedAt: new Date().toISOString(),
          isMastered: true
        });
        toast({ title: "Mission accomplished!", description: "You've mastered this phase." });
      } else {
        toast({ title: "Analysis complete", description: "LocalBrain found areas for improvement." });
      }

    } catch (error: any) {
      console.error("LocalBrain Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile || isGenerating) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center glow-blue text-primary p-6 text-center">
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
          <BrainCircuit className="w-16 h-16 mb-4 opacity-80" />
        </motion.div>
        <h2 className="text-xl font-black uppercase tracking-widest italic animate-pulse">Offline Engine Syncing</h2>
        <p className="text-sm text-muted-foreground mt-4 max-w-sm font-code break-words bg-secondary/30 p-4 rounded-xl border border-border">
          {downloadProgress}
        </p>
        <p className="text-[10px] uppercase font-bold text-primary/50 mt-8 tracking-widest">
          First-time boot requires ~4.5GB asset download. This will only happen once.
        </p>
      </div>
    );
  }

  // No WebGPU — show friendly install instructions
  if (noWebGpu) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center">
        <div className="text-6xl mb-6">🚀</div>
        <h2 className="text-2xl font-black uppercase tracking-tighter italic mb-4 text-primary">
          Open in Chrome
        </h2>
        <p className="text-muted-foreground text-sm max-w-sm leading-relaxed mb-8">
          The offline AI requires <strong className="text-white">WebGPU</strong>, which only works in <strong className="text-white">Chrome</strong> — not inside this APK's browser.
        </p>
        <div className="bg-secondary/20 border border-border rounded-3xl p-6 space-y-4 max-w-sm w-full text-left">
          <p className="text-[10px] uppercase font-bold tracking-widest text-primary">Install Steps</p>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3 items-start">
              <span className="text-primary font-black">1.</span>
              <span className="text-muted-foreground">Open <strong className="text-white">Chrome</strong> on your Android device</span>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-primary font-black">2.</span>
              <span className="text-muted-foreground">Navigate to the app URL shared with you</span>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-primary font-black">3.</span>
              <span className="text-muted-foreground">Tap the Chrome menu → <strong className="text-white">"Add to Home Screen"</strong></span>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-primary font-black">4.</span>
              <span className="text-muted-foreground">Open the installed icon — AI will work perfectly!</span>
            </div>
          </div>
        </div>
        <Button className="mt-8 rounded-2xl" variant="secondary" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="p-4 flex items-center gap-4 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Phase {level} Active</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{mission?.title}</span>
          </div>
          <Progress value={feedback?.isCorrect ? 100 : 40} className="h-1.5 transition-all duration-1000" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
        {/* Objective */}
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-primary" />
            <h2 className="font-headline text-xl font-bold uppercase tracking-tight">Mission Objective</h2>
          </div>
          <div className="bg-secondary/30 rounded-xl p-4 border border-border/50">
            <p className="text-sm leading-relaxed text-muted-foreground">{mission?.description}</p>
          </div>
        </section>

        {/* Editor */}
        <section className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">{language} Compiler Active</span>
            <Button variant="ghost" size="sm" className="h-6 text-[10px] uppercase font-bold" onClick={() => setCode(mission?.starterCode || "")}>
              Reset Code
            </Button>
          </div>
          <div className="relative group">
            <Textarea
              value={code}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCode(e.target.value)}
              placeholder="// Initiate code here..."
              className="font-code min-h-[300px] bg-card/80 border-2 border-border focus:border-primary/50 transition-all resize-none text-sm p-4 shadow-inner"
            />
          </div>
        </section>

        {/* Feedback Display */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-6 rounded-2xl border-2 shadow-2xl ${feedback.isCorrect ? 'border-accent/30 bg-accent/5' : 'border-destructive/30 bg-destructive/5'}`}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className={`p-2 rounded-lg ${feedback.isCorrect ? 'bg-accent/20' : 'bg-destructive/20'}`}>
                  {feedback.isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-accent" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-destructive" />
                  )}
                </div>
                <div>
                  <h4 className={`text-lg font-headline font-black uppercase tracking-tighter ${feedback.isCorrect ? 'text-accent' : 'text-destructive'}`}>
                    {feedback.isCorrect ? "Mission Successful" : "Analysis: Refactoring Required"}
                  </h4>
                  <p className="text-sm mt-1 text-foreground/80 leading-snug">{feedback.feedbackSummary}</p>
                </div>
              </div>

              {feedback.errorsFound.length > 0 && (
                <div className="space-y-4 mb-6">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                    Critical Faults
                  </h5>
                  {feedback.errorsFound.map((err, i) => (
                    <div key={i} className="bg-background/40 p-4 rounded-xl border border-destructive/20 text-xs backdrop-blur-sm">
                      <p className="font-bold text-destructive mb-1 underline decoration-destructive/30 underline-offset-4">Fault Line {err.line || '??'}: {err.message}</p>
                      <p className="text-muted-foreground">{err.explanation}</p>
                    </div>
                  ))}
                </div>
              )}

              {feedback.suggestions.length > 0 && (
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Zap className="w-3 h-3 text-primary" />
                    LocalBrain Optimizations
                  </h5>
                  {feedback.suggestions.map((sug, i) => (
                    <div key={i} className="bg-background/40 p-4 rounded-xl border border-primary/20 text-xs backdrop-blur-sm group">
                      <div className="flex justify-between items-center mb-2">
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase text-[8px]">{sug.type}</span>
                        <span className={`text-[8px] font-bold uppercase ${sug.severity === 'high' ? 'text-orange-500' : 'text-muted-foreground'}`}>{sug.severity} impact</span>
                      </div>
                      <p className="font-bold mb-1 text-foreground/90">{sug.message}</p>
                      <p className="text-muted-foreground/80 mb-3">{sug.explanation}</p>
                      {sug.codeSnippet && (
                        <div className="relative">
                          <pre className="p-3 bg-card/90 rounded-lg font-code text-[10px] overflow-x-auto border border-border/50 text-emerald-400">
                            {sug.codeSnippet}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {feedback.isCorrect && (
                <Button
                  className="w-full mt-8 bg-accent text-accent-foreground hover:bg-accent/90 shadow-[0_0_20px_rgba(34,197,94,0.3)] font-black uppercase tracking-widest py-6 text-sm"
                  onClick={() => router.push("/")}
                >
                  Confirm Mastery & Continue
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Controls */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-card/90 backdrop-blur-md border-t border-border flex gap-3 shadow-2xl">
        <Button
          variant="secondary"
          className="flex-1 gap-2 font-bold uppercase text-[10px] tracking-widest h-12 border-none shadow-md overflow-hidden group relative"
          onClick={() => toast({ title: "LocalBrain Hint Scan...", description: "Think about the data types first." })}
        >
          <motion.div className="absolute inset-0 bg-primary/5 group-active:bg-primary/10 transition-colors" />
          <Lightbulb className="w-4 h-4 text-accent relative z-10" />
          <span className="relative z-10">Get Hint</span>
        </Button>
        <Button
          className="flex-[2] gap-2 shadow-[0_0_25px_rgba(59,130,246,0.3)] font-black uppercase text-[10px] tracking-widest h-12 bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
              <Zap className="w-4 h-4 fill-white" />
            </motion.div>
          ) : (
            <Send className="w-4 h-4" />
          )}
          {isSubmitting ? "Syncing Logic..." : "Deploy Solution"}
        </Button>
      </footer>
    </div>
  );
}
