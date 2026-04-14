export interface Exercise {
  title: string;
  description: string;
}
export interface AdvancedFeedback {
  isCorrect: boolean;
  score: number;
  level: "poor" | "ok" | "good" | "excellent";
  feedbackSummary: string;

  analysis: {
    logic: number;
    readability: number;
    bestPractices: number;
  };

  errorsFound: Array<{
    line: number;
    message: string;
    explanation: string;
  }>;

  suggestions: Array<{
    type: "logic" | "style";
    message: string;
    explanation: string;
  }>;
}