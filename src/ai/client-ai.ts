import { CreateMLCEngine, MLCEngine, InitProgressCallback } from "@mlc-ai/web-llm";


const SELECTED_MODEL = "Phi-3-mini-4k-instruct-q4f16_1-MLC";
let engineInstance: MLCEngine | null = null;
let isInitializing = false;

/**
 * Boots the local WebGPU MLCEngine.
 * Because the model is 2GB, this requires an InitProgressCallback so the UI can show download status.
 */
export async function getLocalEngine(initProgressCallback?: InitProgressCallback): Promise<MLCEngine> {
  // --- MOBILE SAFETY CHECK ---
  // WebGPU is required for on-device AI. It works in Chrome on Android/desktop
  // but NOT in Android's system WebView (used by Capacitor APKs).
  if (typeof navigator !== 'undefined' && !('gpu' in navigator)) {
    throw new Error(
      "NO_WEBGPU: This device does not support WebGPU. " +
      "Please open this app in Chrome on Android and tap 'Add to Home Screen' to install it."
    );
  }

  if (engineInstance) {
    return engineInstance;
  }

  if (isInitializing) {
    while (isInitializing && !engineInstance) {
      await new Promise(r => setTimeout(r, 500));
    }
    if (engineInstance) return engineInstance;
  }

  isInitializing = true;

  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Engine timeout")), 15000)
    );

    const engine = await Promise.race([
      CreateMLCEngine(SELECTED_MODEL, { initProgressCallback }),
      timeout
    ]) as MLCEngine;

    console.log("Engine booted successfully");

    engineInstance = engine;
    return engineInstance;

  } catch (error) {
    console.error("Failed to boot local AI engine:", error);
    throw error;
  } finally {
    isInitializing = false;
  }
}

export function safeParse<T>(text: string): T | null {
  try {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch {
    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return null;
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

export async function generateCustomMission(language: string, level: string, history: string, updateProgress?: InitProgressCallback) {
  try {
    let engine;

    try {
      engine = await getLocalEngine(updateProgress);
    } catch {
      console.warn("Engine failed → fallback");
      return null;
    }

    // We enforce JSON format by instructing Phi-3 heavily
    const prompt = `
You are a coding tutor.

Return ONLY valid JSON.

DO NOT write anything else.

Example format:
{
  "title": "Example",
  "description": "Example",
  "starterCode": "// code"
}

Now generate:

Language: ${language}
Level: ${level}

User weaknesses:
${history || "none"}
`;

    const reply = await engine.chat.completions.create({
      messages: [
        { role: "system", content: "You are a strict programming tutor. Output ONLY JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 250, // 🔥 reduzido
    });

    const text = reply.choices[0].message.content || "";
    console.log("RAW AI RESPONSE:", text);
    const parsed = safeParse<{ title: string, description: string, starterCode: string }>(text);

    console.log("PARSED:", parsed);

    if (
      !parsed ||
      typeof parsed.title !== "string" ||
      typeof parsed.description !== "string" ||
      typeof parsed.starterCode !== "string"
    ) {
      console.warn("Invalid structure → fallback");
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("Local Mission Generation Error:", error);
    return null;
  }
}

export async function generateStructuredAIOutput<T>(
  prompt: string,
  updateProgress?: InitProgressCallback
) {
  try {
    const engine = await getLocalEngine(updateProgress);

    const maxedPrompt = `
You are a strict but helpful programming tutor.

Analyze the student's code.

Give:
1. What is wrong (specific)
2. Why it's wrong
3. A hint (DO NOT give full solution)
4. Focus on their past mistakes if relevant

Student history:
${prompt}

Return ONLY JSON:
{
  "isCorrect": boolean,
  "feedbackSummary": string,
  "errorsFound": string[],
  "suggestions": [
    {
      "message": string,
      "severity": "low" | "medium" | "high",
      "type": "logic" | "syntax",
      "explanation": string
    }
  ]
}
`;
    const reply = await engine.chat.completions.create({
      messages: [
        { role: "system", content: "You are a strict programming grader. You output pure JSON only." },
        { role: "user", content: maxedPrompt }
      ],
      temperature: 0.1, // extremely low for grading
      max_tokens: 250,
    });

    const text = reply.choices[0].message.content || "";

    const parsed = safeParse<T>(text);
    if (!parsed) {
      console.warn("AI returned invalid JSON → using fallback. Raw text:", text);

      return {
        isCorrect: false,
        feedbackSummary: "AI response invalid. Focus on your logic and try again.",
        errorsFound: [],
        suggestions: [
          {
            message: "Check your logic step by step",
            severity: "medium",
            type: "logic",
            explanation: "The AI could not parse your code properly, but there may be a logic issue."
          }
        ]
      } as T;
    }
    return parsed;
  } catch (error) {
    console.error("Local AI Generation Error:", error);

    return {
      isCorrect: false,
      feedbackSummary: "AI failed to run. Using fallback feedback.",
      errorsFound: [],
      suggestions: [
        {
          message: "Break the problem into smaller parts",
          severity: "low",
          type: "logic",
          explanation: "When unsure, simplify your approach."
        }
      ]
    } as T;
  }
}
