"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Send, Play, Lightbulb, CheckCircle2, AlertCircle, Zap, Rocket, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { generateStructuredAIOutput, generateLocalHint } from "@/ai/client-ai";
import { localAi } from "@/ai/local-client";
import { motion, AnimatePresence } from "framer-motion";

interface FeedbackError {
  line?: number;
  message: string;
  explanation: string;
}

interface FeedbackSuggestion {
  type: 'readability' | 'performance' | 'best_practice' | 'optimization' | 'style' | 'logic';
  message: string;
  explanation: string;
  codeSnippet?: string;
}

interface PersonalizedCodeFeedback {
  isCorrect: boolean;
  feedbackSummary: string;
  errorsFound: FeedbackError[];
  suggestions: FeedbackSuggestion[];
  improvedCodeSnippet?: string;
}
import { COURSES } from "@/app/lib/courses-data";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { doc, collection, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { getPastUserErrorsSummary } from "@/lib/user-progress";

interface ExerciseClientProps {
  id: string;
}

export default function ExerciseClient({ id }: ExerciseClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();

  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryStatus, setRetryStatus] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<PersonalizedCodeFeedback | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [hintRetryStatus, setHintRetryStatus] = useState<string | null>(null);
  const [localAiStatus, setLocalAiStatus] = useState<string>("Local AI Idle");
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  useEffect(() => {
    localAi.setProgressCallback((data: any) => {
      if (data.status === 'initiate') setLocalAiStatus("Initializing Local AI...");
      if (data.status === 'progress') {
        setLocalAiStatus(`Downloading... ${Math.round(data.progress)}%`);
        setDownloadProgress(data.progress);
      }
      if (data.status === 'ready') setLocalAiStatus("Local AI Ready (Offline)");
    });
  }, []);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace("/login");
    }
  }, [user, isUserLoading, router]);

  // Find current exercise in global data
  const currentExercise = COURSES.flatMap(c => c.skills).find(s => s.id === id) || {
    id: "unknown",
    title: "Unknown Challenge",
    description: "Challenge details not found.",
    language: "Code",
    starterCode: "// Start coding here..."
  };

  useEffect(() => {
    if (currentExercise) {
      setCode(currentExercise.starterCode);
    }
  }, [id, currentExercise]);

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast({ title: "Write some code first!", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    setRetryStatus(null);
    setFeedback(null);

    try {
      let pastUserErrors = undefined;
      // ... same errorSummary logic ...
      if (user && db) {
        const errorSummary = await getPastUserErrorsSummary(db, user.uid);
        if (errorSummary) {
          pastUserErrors = errorSummary;
        }
      }

      const prompt = `You are an expert programming tutor designed to provide comprehensive, personalized feedback on user-submitted code.
Your goal is to help the user understand their mistakes, learn efficiently, and improve their coding skills.

The user has submitted code for a coding exercise. Analyze their code for correctness, efficiency, readability, and adherence to best practices.

EXERCISE DESCRIPTION:
${currentExercise.description}

USER'S CODE (${currentExercise.language}):
\`\`\`${currentExercise.language}
${code}
\`\`\`

${pastUserErrors ? `USER'S PAST ERRORS SUMMARY:
${pastUserErrors}
Use this information to provide more personalized and relevant feedback.` : ""}

Return ONLY a valid JSON object with this structure:
{
  "isCorrect": boolean,
  "feedbackSummary": "string",
  "errorsFound": [
    { "line": number, "message": "string", "explanation": "string" }
  ],
  "suggestions": [
    { "type": "readability" | "performance" | "best_practice" | "optimization" | "style" | "logic", "message": "string", "explanation": "string", "codeSnippet": "string" }
  ],
  "improvedCodeSnippet": "string"
}
`;

      let result: PersonalizedCodeFeedback;

      try {
        result = await generateStructuredAIOutput<PersonalizedCodeFeedback>(
          prompt, 
          undefined, 
          true, 
          (attempt) => setRetryStatus(`Analyzing... Retry ${attempt}/6`)
        );
      } catch (cloudErr) {
        // LOCAL FALLBACK: Basic heuristic code evaluation
        console.warn("Cloud AI unavailable, using local evaluator:", cloudErr);
        setRetryStatus("Local Brain...");
        
        const trimmedCode = code.trim();
        const starterTrimmed = currentExercise.starterCode.trim();
        const isUnchanged = trimmedCode === starterTrimmed || trimmedCode === "// Your code here" || trimmedCode.length < 5;
        
        const errors: FeedbackError[] = [];
        const suggestions: FeedbackSuggestion[] = [];

        if (isUnchanged) {
          errors.push({ line: 1, message: "Code unchanged", explanation: "You haven't modified the starter code yet. Try writing your solution!" });
        }
        
        // Check for common syntax issues
        const openParens = (trimmedCode.match(/\(/g) || []).length;
        const closeParens = (trimmedCode.match(/\)/g) || []).length;
        if (openParens !== closeParens) {
          errors.push({ line: 1, message: "Mismatched parentheses", explanation: `You have ${openParens} opening ( and ${closeParens} closing ). Make sure they match!` });
        }

        const openBraces = (trimmedCode.match(/\{/g) || []).length;
        const closeBraces = (trimmedCode.match(/\}/g) || []).length;
        if (openBraces !== closeBraces) {
          errors.push({ line: 1, message: "Mismatched braces", explanation: `You have ${openBraces} opening { and ${closeBraces} closing }. Check your code blocks!` });
        }

        if (trimmedCode.includes("console.log") && currentExercise.description.toLowerCase().includes("return")) {
          suggestions.push({ type: "logic", message: "Use 'return' instead of console.log", explanation: "The exercise asks you to return a value, not print it.", codeSnippet: "return result;" });
        }

        const hasLogic = trimmedCode.length > starterTrimmed.length + 10;
        
        result = {
          isCorrect: hasLogic && errors.length === 0,
          feedbackSummary: errors.length > 0 
            ? `Found ${errors.length} issue(s). Review and fix them to continue!`
            : hasLogic
              ? "Your code looks structurally sound! The cloud AI wasn't available for deep analysis, but your syntax checks passed. Great work!"
              : "Add more code to complete the exercise. Look at the description for guidance.",
          errorsFound: errors,
          suggestions: suggestions.length > 0 ? suggestions : [{ type: "best_practice", message: "Keep coding!", explanation: "The local evaluator checked your syntax. For deeper analysis, try again when the cloud AI is available.", codeSnippet: "" }],
          improvedCodeSnippet: undefined
        };
      }
      
      setFeedback(result);

      if (user && db) {
        // Record Attempt
        const attemptRef = collection(db, "users", user.uid, "exerciseAttempts");
        addDocumentNonBlocking(attemptRef, {
          userId: user.uid,
          exerciseId: currentExercise.id,
          attemptNumber: 1,
          submittedCode: code,
          isCorrect: result.isCorrect,
          feedbackSummary: result.feedbackSummary,
          submittedAt: serverTimestamp(),
        });

        // Update Progress
        if (result.isCorrect) {
          const progressId = `${user.uid}_${currentExercise.id}`;
          const progressRef = doc(db, "users", user.uid, "lessonProgress", progressId);
          setDocumentNonBlocking(progressRef, {
            id: progressId,
            userId: user.uid,
            lessonId: currentExercise.id,
            status: "Completed",
            completedAt: serverTimestamp(),
            isMastered: true
          }, { merge: true });

          toast({ title: "Great job! Challenge complete." });
        }
      }

      if (!result.isCorrect) {
        toast({ title: "Keep trying! Check the feedback.", variant: "default" });
      }
    } catch (error: any) {
      toast({ title: "Evaluation failed.", description: error.message || "An unknown error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
      setRetryStatus(null);
    }
  };

  const handleGetHint = async () => {
    setIsHintLoading(true);
    setHintRetryStatus(null);
    setHint(null);

    try {
      let pastUserErrors = "";
      let pacingMetrics = "";
      
      if (user && db) {
        const [errors, pacing]: [string, string] = await Promise.all([
          getPastUserErrorsSummary(db, user.uid),
          import("@/lib/user-progress").then(m => m.getUserPacingMetrics(db, user.uid))
        ]);
        pastUserErrors = errors;
        pacingMetrics = pacing;
      }

      const prompt = `You are a supportive AI coding tutor. A student is working on the following exercise and needs a hint.
      
EXERCISE: ${currentExercise.title}
DESCRIPTION: ${currentExercise.description}
CURRENT CODE:
\`\`\`${currentExercise.language}
${code}
\`\`\`

CONTEXT:
${pastUserErrors ? `User's recent struggles:\n${pastUserErrors}` : ""}
${pacingMetrics ? `Learner profile:\n${pacingMetrics}` : ""}

Provide a subtle, encouraging hint that helps the student overcome their current obstacle without giving away the full solution. 
If they have a specific error in their code, point them in the right direction. 
If they are a fast learner, make the hint more of a mental nudge. 
If they are struggling, provide more conceptual scaffolding.

Return ONLY a valid JSON object:
{
  "hint": "string"
}`;

      try {
        const res = await generateStructuredAIOutput<{hint: string}>(
          prompt, 
          undefined, 
          true, 
          (attempt) => setHintRetryStatus(`R${attempt}/6`)
        );
        setHint(res.hint);
      } catch (cloudErr) {
        console.warn("Cloud AI failed, triggering Local Brain...");
        setHintRetryStatus("Local Brain...");
        const localRes = await generateLocalHint(currentExercise.title, currentExercise.description, code);
        setHint(localRes);
      }
    } catch (error: any) {
      toast({ title: "Could not generate hint.", description: "Try again in a moment.", variant: "destructive" });
    } finally {
      setIsHintLoading(false);
      setHintRetryStatus(null);
    }
  };

  if (isUserLoading || !user) {
    return <div className="min-h-screen bg-background flex flex-col items-center justify-center glow-blue text-primary animate-pulse"><Rocket className="w-12 h-12" /></div>;
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* Exercise Header */}
      <header className="p-4 flex items-center gap-4 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Mission Progress</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Skill: {currentExercise.title}</span>
          </div>
          <Progress value={feedback?.isCorrect ? 100 : 40} className="h-1.5 transition-all" />
          <div className="flex justify-between items-center mt-2">
            <span className={`text-[8px] font-bold uppercase tracking-tighter ${localAiStatus === 'Local AI Ready (Offline)' ? 'text-accent' : 'text-primary'}`}>
              {localAiStatus}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
        <section>
          <h2 className="font-headline text-2xl font-bold mb-2">{currentExercise.title}</h2>
          <div className="bg-secondary/50 rounded-xl p-4 border border-border">
            <p className="text-sm leading-relaxed">{currentExercise.description}</p>
          </div>
        </section>

        {/* Editor Area */}
        <section className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-code text-muted-foreground">{currentExercise.language} Editor</span>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setCode(currentExercise.starterCode)}>
              Reset
            </Button>
          </div>
          <div className="relative group">
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Write your solution here..."
              className="font-code min-h-[250px] bg-card border-2 border-border focus:border-primary transition-all resize-none text-sm p-4 glow-blue"
            />
          </div>
        </section>

        {/* AI Feedback Display */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-5 rounded-2xl border-2 ${feedback.isCorrect ? 'border-accent/40 bg-accent/5' : 'border-destructive/40 bg-destructive/5'}`}
            >
              <div className="flex items-start gap-3 mb-4">
                {feedback.isCorrect ? (
                  <CheckCircle2 className="w-6 h-6 text-accent shrink-0" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-destructive shrink-0" />
                )}
                <div>
                  <h4 className={`font-headline font-bold ${feedback.isCorrect ? 'text-accent' : 'text-destructive'}`}>
                    {feedback.isCorrect ? "MISSION SUCCESSFUL" : "CORRECTION NEEDED"}
                  </h4>
                  <p className="text-sm mt-1">{feedback.feedbackSummary}</p>
                </div>
              </div>

              {feedback.errorsFound.length > 0 && (
                <div className="space-y-3 mb-4">
                  <h5 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Errors Found</h5>
                  {feedback.errorsFound.map((err: FeedbackError, i: number) => (
                    <div key={i} className="bg-background/50 p-3 rounded-lg border border-border text-xs">
                      <p className="font-bold text-destructive mb-1">Line {err.line}: {err.message}</p>
                      <p className="text-muted-foreground italic">{err.explanation}</p>
                    </div>
                  ))}
                </div>
              )}

              {feedback.suggestions.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Expert Suggestions</h5>
                  {feedback.suggestions.map((sug: FeedbackSuggestion, i: number) => (
                    <div key={i} className="bg-background/50 p-3 rounded-lg border border-border text-xs">
                      <div className="flex justify-between mb-1">
                        <span className="font-bold text-primary uppercase text-[10px] tracking-tighter">{sug.type}</span>
                      </div>
                      <p className="font-bold mb-1">{sug.message}</p>
                      <p className="text-muted-foreground mb-2">{sug.explanation}</p>
                      {sug.codeSnippet && (
                        <pre className="p-2 bg-secondary rounded mt-2 font-code text-[10px] overflow-x-auto border border-border">
                          {sug.codeSnippet}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {feedback.isCorrect && (
                <Button 
                  className="w-full mt-6 bg-accent text-accent-foreground hover:bg-accent/90 glow-green font-bold uppercase tracking-widest"
                  onClick={() => router.push("/")}
                >
                  Continue Journey
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {hint && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-primary/10 border-2 border-primary/30 p-4 rounded-xl flex items-start gap-3 mt-4"
            >
              <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <h5 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">AI Tactical Hint</h5>
                <p className="text-sm italic text-foreground/90">{hint}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setHint(null)} className="h-6 w-6 p-0 hover:bg-primary/20">
                ×
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border flex gap-3">
        <Button 
          variant="secondary" 
          className="flex-1 gap-2 font-bold uppercase text-xs tracking-widest"
          onClick={handleGetHint}
          disabled={isHintLoading}
        >
          {isHintLoading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
              <BrainCircuit className="w-4 h-4 text-accent" />
            </motion.div>
          ) : (
            <Lightbulb className="w-4 h-4 text-accent" />
          )}
          {isHintLoading ? (hintRetryStatus || "Wait...") : "Get Hint"}
        </Button>
        <Button 
          className="flex-[2] gap-2 glow-blue font-bold uppercase text-xs tracking-widest"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <Zap className="w-4 h-4" />
            </motion.div>
          ) : (
            <Send className="w-4 h-4" />
          )}
          {isSubmitting ? (retryStatus || "ANALYZING...") : "SUBMIT CODE"}
        </Button>
      </footer>
    </div>
  );
}
