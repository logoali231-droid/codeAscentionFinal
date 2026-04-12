"use client";

import { getAIEngine } from "./webllm";

export async function generateFeedback(code: string) {
  const engine = await getAIEngine();

  const response = await engine.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a programming mentor. Give short, clear feedback.",
      },
      {
        role: "user",
        content: `Analyze this code and give feedback:\n\n${code}`,
      },
    ],
    max_tokens: 120,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || "No response";
}