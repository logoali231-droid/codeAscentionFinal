import { localAi, getHeuristicHint } from "./local-client";
import { saveToMemory } from "./memory";
import { getAIEngine } from "./webllm";


/**
 * Hash para cache
 */
export async function generateExercise(topic: string, difficulty: string) {
  const engine = await getAIEngine();

  const prompt = `
Create a programming exercise.

Topic: ${topic}
Difficulty: ${difficulty}

Respond ONLY in JSON:
{
  "title": "...",
  "description": "..."
}
`;

  const response = await engine.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
  });
  const text = response.choices[0].message.content ?? "";

if (!text.trim()) {
  return {
    title: topic,
    description: "AI failed to generate content. Try again.",
  };
}

try {
  return JSON.parse(text);
} catch {
  return {
    title: topic,
    description: text,
  };
}
}

function hashPrompt(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return "ai_cache_" + Math.abs(hash).toString(36);
}

/**
 * Limpa cache
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
 * AI estruturada (JSON)
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
 * 🔥 GERA EXERCÍCIO BASEADO NA MEMÓRIA DO USUÁRIO
 */
export async function generatePersonalizedExercise() {
  try {
    const memoryRaw = localStorage.getItem("ai_memory");
    const memory = memoryRaw ? JSON.parse(memoryRaw) : [];

    if (memory.length === 0) {
      return {
        title: "Intro Exercise",
        description: "Create a simple function that returns a number.",
      };
    }

    // pega o erro mais frequente
    const topError = memory.sort((a: any, b: any) => b.count - a.count)[0];

    if (!topError?.topic) {
  return {
    title: "Practice Basics",
    description: "Write a simple function that returns a value.",
  };
}

  return await generateExercise(topError.topic, "beginner");

  } catch (err) {
    console.warn("Exercise generation failed:", err);

    return {
      title: "Fallback Exercise",
      description: "Write a loop that prints numbers from 1 to 10.",
    };
  }
}

/**
 * Hint inteligente com fallback
 */
export async function generateLocalHint(
  exerciseTitle: string,
  exerciseDescription: string,
  code: string
): Promise<string> {

  // Tier 1: AI
  if (localAi.isReady()) {
    try {
      const prompt = `User is working on: ${exerciseTitle}. ${exerciseDescription}
Code:
${code}
Give a short hint:`;

      const response = await localAi.generate(prompt);

      if (response && response.trim().length > 10) {
        return response.trim();
      }
    } catch (err) {
      console.warn("AI failed, fallback heuristic:", err);
    }
  }

  // Tier 2: heurística
  try {
    return getHeuristicHint(exerciseTitle, exerciseDescription, code);
  } catch (err) {}

  // Tier 3: fallback
  return "Break the problem into smaller steps and try again.";
}