
import { localAi, getHeuristicHint } from "./local-client";
import { saveToMemory } from "./memory";

/**
 * Client-side AI utility using direct Google Generative AI SDK.
 * This ensures compatibility with standalone APKs and environments without a Node.js server.
 */

// For standalone device builds, we ensure the key is always available.





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
  prompt: string
): Promise<T> {
  try {
    const response = await localAi.generate(prompt);

    return JSON.parse(response) as T;
  } catch (err) {
    console.warn("Local AI failed:", err);
    throw err;
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
