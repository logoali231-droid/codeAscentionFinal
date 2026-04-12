"use client";

import * as webllm from "@mlc-ai/web-llm";

let engine: webllm.MLCEngine | null = null;

"use client";



"use client";

export async function generateExercise(topic: string, difficulty: string) {
  let engine;

  try {
    engine = await getAIEngine();
  } catch (err) {
    console.warn("AI not supported, using fallback:", err);

    // 🔥 FALLBACK SEM IA
    return {
      title: `Practice ${topic}`,
      description: `Create a simple ${difficulty} exercise about ${topic}.`,
    };
  }

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
      description: "AI failed. Try again.",
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

import { getUserMemory } from "./memory";

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

    const topError = memory.sort(
      (a: any, b: any) => b.count - a.count
    )[0];

    return await generateExercise(topError.topic, "beginner");

  } catch (err) {
    console.warn("Exercise generation failed:", err);

    return {
      title: "Fallback Exercise",
      description: "Write a loop that prints numbers from 1 to 10.",
    };
  }
}
export async function getAIEngine() {
  if (engine) return engine;

  if (!("gpu" in navigator)) {
    throw new Error("WebGPU not supported");
  }

  engine = await webllm.CreateMLCEngine(
    "Phi-3-mini-4k-instruct-q4f16_1", // 👈 STRING, não objeto
    {
      initProgressCallback: (progress: any) => {
        console.log("Loading AI:", progress);
      },
    }
  );

  return engine;
}