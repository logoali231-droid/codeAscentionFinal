
// src/lib/engine.ts
export type ErrorLogEntry = {
  topic: string;
  userExplanation: string;
  difficultyRating: number;
  timestamp: number;
};

export type UserProfile = {
  name: string;
  email: string;
  expertise: 'Beginner' | 'Intermediate' | 'Pro';
  xp: number;
  badges: number;
  rank: string;
  errorLog: ErrorLogEntry[];
};

const DEFAULT_USER: UserProfile = {
  name: 'Ali Logo',
  email: 'logoali231@gmail.com',
  expertise: 'Beginner',
  xp: 0,
  badges: 0,
  rank: '#99+',
  errorLog: []
};

export const getLocalUser = (): UserProfile => {
  if (typeof window === 'undefined') return DEFAULT_USER;
  const data = localStorage.getItem('user');
  return data ? { ...DEFAULT_USER, ...JSON.parse(data) } : DEFAULT_USER;
};

export const saveUser = (user: UserProfile) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export const logStruggle = (topic: string, why: string, difficulty: number) => {
  const user = getLocalUser();
  user.errorLog.push({ topic, userExplanation: why, difficultyRating: difficulty, timestamp: Date.now() });
  saveUser(user);
};

// This is the function that was causing the error - renamed and exported clearly

// src/lib/engine.ts

// ... keep existing types (UserProfile, etc) ...

export const analyzeStruggleWithAI = (userExplanation: string): string => {
  const note = userExplanation.toLowerCase();
  
  // Simulated AI "Reasoning" Engine
  if (note.includes('syntax') || note.includes('error')) {
    return "The AI detected a Syntax Gap. It recommends focusing on Bracket consistency.";
  }
  if (note.includes('loop') || note.includes('repeat')) {
    return "Logic Analysis: The user is struggling with Iteration Control. Adjusting curriculum difficulty.";
  }
  if (note.length < 5) {
    return "Insufficient data for AI analysis. Please provide more detail on your struggle.";
  }
  
  return "AI Analysis Complete: Topic 'Conceptual' requires a simplified review module.";
};

export const getSmartNextTopic = (): string => {
  const user = getLocalUser();
  if (!user.errorLog || user.errorLog.length === 0) return "Fundamentals";
  
  const lastError = user.errorLog[user.errorLog.length - 1];
  
  // The AI "Brains" the next topic
  const analysis = analyzeStruggleWithAI(lastError.userExplanation);
  console.log("AI BRAIN:", analysis); // For debugging
  
  if (analysis.includes('Syntax')) return "Syntax Masterclass";
  if (analysis.includes('Iteration')) return "Loop Fundamentals";
  
  return lastError.topic + " Review";
};