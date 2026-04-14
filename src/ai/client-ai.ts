"use client";

import { getHeuristicHint } from "./local-client";
import { generateExercise } from "./webllm";
import type { Exercise } from "./types";
import { updateDifficulty, getPerformance } from "./difficulty";

function getAdaptiveDifficulty(count: number): string {
  if (count > 15) return "very easy";
  if (count > 8) return "easy";
  return "beginner";
}

function buildContext(memory: any[]): string {
  return memory
    .slice(0, 5)
    .map((m) => `${m.topic} (${m.type}) x${m.count}`)
    .join(", ");
}

// 🔥 EXERCÍCIO INTELIGENTE BASEADO NO USUÁRIO
export async function safeGenerateExercise(): Promise<Exercise> {
  try {
    if (typeof window === "undefined") {
      throw new Error("No window");
    }

    const memoryRaw = localStorage.getItem("ai_memory") || "[]";
    const memory = JSON.parse(memoryRaw);
    

    if (!Array.isArray(memory) || memory.length === 0) {
      return {
        title: "Intro Exercise",
        description: "Create a function that returns a number.",
      };
    }

    const topError = memory.sort(
      (a: any, b: any) => b.count - a.count
    )[0];

    const difficulty = getAdaptiveDifficulty(topError.count);
    const context = buildContext(memory);

   const performance = getPerformance();
   

const ai = await generateExercise(
  topError.topic,
  performance.level
);

    if (!ai || !ai.description) {
      throw new Error("Invalid AI response");
    }

    return ai;

  } catch (err) {
    console.warn("AI failed, using fallback:", err);

    return {
      title: "Fallback Exercise",
      description: "Write a loop that prints numbers from 1 to 10.",
    };
  }
}

// 🔥 JSON AI OUTPUT (ROBUSTO)
export async function generateStructuredAIOutput<T>(
  prompt: string,
  retry: boolean = false
): Promise<T> {
  const maxRetries = retry ? 5 : 1;
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const ai = await generateExercise(prompt, "beginner");
      return ai as T;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("AI failed");
}

// 🔥 HINT EM 3 CAMADAS
export async function generateLocalHint(
  title: string,
  description: string,
  code: string
): Promise<string> {
  try {
    const ai = await generateExercise(title, "beginner");
    if (ai?.description) return ai.description;
  } catch {}

  try {
    return getHeuristicHint(title, description, code);
  } catch {}

  return "Break the problem into smaller steps and try again.";
}

export function clearAiCache() {
  console.log("AI cache cleared");
}