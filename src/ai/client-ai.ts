import { GoogleGenerativeAI } from "@google/generative-ai";
import { localAi, getHeuristicHint } from "./local-client";

/**
 * Client-side AI utility using direct Google Generative AI SDK.
 * This ensures compatibility with standalone APKs and environments without a Node.js server.
 */

// For standalone device builds, we ensure the key is always available.
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!API_KEY && typeof window !== 'undefined') {
  console.warn("NEXT_PUBLIC_GEMINI_API_KEY is missing. AI features will not work.");
}

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export const getClientAiModel = (modelName: string = "gemini-2.0-flash") => {
  const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!key && typeof window !== 'undefined') {
    throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is missing from the browser environment. If you just added it to .env.local, please restart your 'npm run dev' terminal.");
  }
  
  return genAI.getGenerativeModel({ 
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
    }
  });
};

/**
 * A simple hash function to turn long prompts into safe localStorage keys.
 */
function hashPrompt(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return "ai_cache_" + Math.abs(hash).toString(36);
}

/**
 * Executes an AI generation request with automatic retries and exponential backoff
 * to handle quota limits gracefully.
 */
async function generateWithRetry(
  model: any, 
  prompt: string, 
  maxRetries = 6,
  onRetry?: (attempt: number, waitTime: number) => void
): Promise<string> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      lastError = error;
      const isQuotaError = error.message?.includes("429") || error.message?.includes("quota");
      const isOverloaded = error.message?.includes("503") || error.message?.includes("overloaded");
      
      if ((isQuotaError || isOverloaded) && attempt < maxRetries) {
        // Longer backoff for stability
        const waitTime = Math.pow(2.5, attempt + 1) * 1000;
        console.warn(`AI Busy (Attempt ${attempt + 1}/${maxRetries}). Retrying in ${waitTime}ms...`);
        if (onRetry) onRetry(attempt + 1, waitTime);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

/**
 * Utility to clear the local AI cache if the user gets stuck.
 */
export function clearAiCache() {
  if (typeof window === 'undefined') return;
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith("ai_cache_")) {
      localStorage.removeItem(key);
    }
  });
}

/**
 * General helper to run a structured prompt on the client with caching and retries.
 */
export async function generateStructuredAIOutput<T>(
  prompt: string, 
  modelName: string = "gemini-1.5-flash",
  useCache: boolean = true,
  onRetry?: (attempt: number, waitTime: number) => void
): Promise<T> {
  const cacheKey = hashPrompt(prompt + modelName);
  
  if (useCache && typeof window !== 'undefined') {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached) as T;
      } catch (e) {
        localStorage.removeItem(cacheKey);
      }
    }
  }

  try {
    const model = getClientAiModel(modelName);
    const text = await generateWithRetry(model, prompt, 3, onRetry);
    
    if (useCache && typeof window !== 'undefined') {
      localStorage.setItem(cacheKey, text);
    }
    
    return JSON.parse(text) as T;
  } catch (error: any) {
    // If quote error, and it's a simple hint, we could try the local brain here
    console.error("Client AI Generation Error:", error);
    throw error;
  }
}

/**
 * Generates a high-quality local hint using a 3-tier fallback system.
 * This function NEVER throws and NEVER fails.
 * 
 * Tier 1: TinyLlama Worker (if available and device supports it)
 * Tier 2: Smart Heuristic Database (always works, instant, offline)
 * Tier 3: Generic encouragement (absolute last resort)
 */
export async function generateLocalHint(
  exerciseTitle: string, 
  exerciseDescription: string, 
  code: string
): Promise<string> {
  // Tier 1: Try the AI Worker if it's available
  if (localAi.isReady()) {
    try {
      const prompt = `User is working on: ${exerciseTitle}. ${exerciseDescription}\nTheir code:\n${code}\nGive a short, helpful coding hint:`;
      const response = await localAi.generate(prompt);
      if (response && response.trim().length > 10) {
        return response.trim();
      }
    } catch (err) {
      console.warn("Tier 1 (Worker AI) failed, using Tier 2 (Heuristic Engine):", err);
    }
  }

  // Tier 2: Smart heuristic database (ALWAYS works)
  try {
    return getHeuristicHint(exerciseTitle, exerciseDescription, code);
  } catch (err) {
    console.warn("Tier 2 (Heuristic) failed, using Tier 3 (Generic):", err);
  }

  // Tier 3: Absolute fallback
  return "Take a step back and re-read the exercise description carefully. Break the problem into smaller pieces and tackle them one at a time!";
}
