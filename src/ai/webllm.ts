"use client";

import * as webllm from "@mlc-ai/web-llm";

interface Exercise {
  title: string;
  description: string;
}

let engine: webllm.MLCEngine | null = null;

export async function getAIEngine() {
  if (engine) return engine;

  if (!("gpu" in navigator)) {
    throw new Error("WebGPU not supported");
  }

  engine = await webllm.CreateMLCEngine(
    "Phi-3-mini-4k-instruct-q4f16_1",
    {
      appConfig: {
        model_list: [
          {
            model: "Phi-3-mini-4k-instruct-q4f16_1",
            model_id: "Phi-3-mini-4k-instruct-q4f16_1",
            model_lib:
              "https://mlc.ai/models/Phi-3-mini-4k-instruct-q4f16_1/resolve/main/",
          },
        ],
      },
      initProgressCallback: (progress: any) => {
        console.log("Loading AI:", progress);
      },
    }
  );

  return engine;
}

export async function generateExercise(
  topic: string,
  difficulty: string
): Promise<Exercise> {
  const engine = await getAIEngine();

  const prompt = `
You are a programming teacher.

Create a simple exercise.

Topic: ${topic}
Difficulty: ${difficulty}

STRICT RULES:
- Output ONLY valid JSON
- No explanation
- No markdown

Format:
{
  "title": "...",
  "description": "..."
}
`;

  const response = await engine.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
  });

  let text = response.choices[0].message.content ?? "";
  text = text.trim();

  // limpa markdown se vier
  if (text.startsWith("```")) {
    text = text.replace(/```json|```/g, "").trim();
  }

  const match = text.match(/\{[\s\S]*\}/);

  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch {}
  }

  return {
    title: `Exercise: ${topic}`,
    description: text || "Try to code something about this topic.",
  };
}