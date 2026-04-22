import { buildPrompt } from "./generator";

export async function generateLesson(input: string) {
  const prompt = buildPrompt(input);

  await new Promise((r) => setTimeout(r, 500));

  return prompt + "\n\n--- GENERATED ---";
}