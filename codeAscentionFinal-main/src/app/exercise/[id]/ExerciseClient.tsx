"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Send, Lightbulb, CheckCircle2, AlertCircle, Zap, Rocket, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { generateStructuredAIOutput, generateLocalHint } from "@/ai/client-ai";
import { localAi } from "@/ai/local-client";
import { motion, AnimatePresence } from "framer-motion";
import { getMemory, saveToMemory } from "@/ai/memory";
import { COURSES } from "@/app/lib/courses-data";

const memory = getMemory();

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

interface ExerciseClientProps {
  id: string;
}

export default function ExerciseClient({ id }: ExerciseClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const currentExercise =
    COURSES.flatMap(c => c.skills).find(s => s.id === id) || {
      id: "unknown",
      title: "Unknown Challenge",
      description: "Challenge details not found.",
      language: "Code",
      starterCode: "// Start coding here..."
    };

  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<PersonalizedCodeFeedback | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [localAiStatus, setLocalAiStatus] = useState("Local AI Idle");

  useEffect(() => {
    setCode(currentExercise.starterCode);
  }, [id]);

  useEffect(() => {
    localAi.setProgressCallback((data: any) => {
      if (data.status === "initiate") setLocalAiStatus("Initializing...");
      if (data.status === "progress") setLocalAiStatus(`Downloading ${Math.round(data.progress)}%`);
      if (data.status === "ready") setLocalAiStatus("Ready (Offline)");
    });
  }, []);

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast({ title: "Write some code first!", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const prompt = `
EXERCISE:
${currentExercise.description}

CODE:
${code}

Return JSON with feedback.
`;

      let result: PersonalizedCodeFeedback;

      try {
        result = await generateStructuredAIOutput<PersonalizedCodeFeedback>(prompt);
      } catch {
        // fallback
        result = {
          isCorrect: code.length > currentExercise.starterCode.length + 10,
          feedbackSummary: "Basic local evaluation complete.",
          errorsFound: [],
          suggestions: [],
        };
      }

      setFeedback(result);

      if (!result.isCorrect) {
        saveToMemory(result.feedbackSummary);
        toast({ title: "Keep trying!" });
      } else {
        toast({ title: "Nice! Completed." });
      }

    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetHint = async () => {
    setIsHintLoading(true);
    setHint(null);

    try {
      try {
        const res = await generateStructuredAIOutput<{ hint: string }>(`
Exercise: ${currentExercise.description}
Code: ${code}
Give hint
`);
        setHint(res.hint);
      } catch {
        const local = await generateLocalHint(
          currentExercise.title,
          currentExercise.description,
          code
        );
        setHint(local);
      }
    } finally {
      setIsHintLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="p-4 flex items-center gap-4 border-b">
        <Button onClick={() => router.back()}>
          <ChevronLeft />
        </Button>
        <div className="flex-1">
          <p>{currentExercise.title}</p>
          <Progress value={feedback?.isCorrect ? 100 : 40} />
          <small>{localAiStatus}</small>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-4">
        <p>{currentExercise.description}</p>

        <Textarea value={code} onChange={(e) => setCode(e.target.value)} />

        {feedback && (
          <div>
            {feedback.isCorrect ? <CheckCircle2 /> : <AlertCircle />}
            <p>{feedback.feedbackSummary}</p>
          </div>
        )}

        {hint && <p>{hint}</p>}
      </main>

      <footer className="p-4 flex gap-2">
        <Button onClick={handleGetHint} disabled={isHintLoading}>
          <Lightbulb /> Hint
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? <Zap /> : <Send />}
        </Button>
      </footer>
    </div>
  );
}