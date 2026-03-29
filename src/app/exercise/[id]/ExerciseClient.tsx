"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Send, Play, Lightbulb, CheckCircle2, AlertCircle, Zap, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { personalizedCodeFeedback, type PersonalizedCodeFeedbackOutput } from "@/ai/flows/personalized-code-feedback";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
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
  const [feedback, setFeedback] = useState<PersonalizedCodeFeedbackOutput | null>(null);

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
    setFeedback(null);

    try {
      let pastUserErrors = undefined;
      if (user && db) {
        const errorSummary = await getPastUserErrorsSummary(db, user.uid);
        if (errorSummary) {
          pastUserErrors = errorSummary;
        }
      }

      const result = await personalizedCodeFeedback({
        userCode: code,
        exerciseDescription: currentExercise.description,
        language: currentExercise.language,
        pastUserErrors: pastUserErrors
      });
      
      setFeedback(result);

      if (user && db) {
        // Record Attempt
        const attemptRef = collection(db, "users", user.uid, "exerciseAttempts");
        addDocumentNonBlocking(attemptRef, {
          userId: user.uid,
          exerciseId: currentExercise.id,
          attemptNumber: 1, // Simplified for MVP
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
      toast({ title: "Failed to analyze code.", description: error.message || "An unknown error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
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
                  {feedback.errorsFound.map((err, i) => (
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
                  {feedback.suggestions.map((sug, i) => (
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
      </main>

      {/* Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border flex gap-3">
        <Button 
          variant="secondary" 
          className="flex-1 gap-2 font-bold uppercase text-xs tracking-widest"
          onClick={() => toast({ title: "Focus on the objective description above!" })}
        >
          <Lightbulb className="w-4 h-4 text-accent" />
          Get Hint
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
          {isSubmitting ? "ANALYZING..." : "SUBMIT CODE"}
        </Button>
      </footer>
    </div>
  );
}
