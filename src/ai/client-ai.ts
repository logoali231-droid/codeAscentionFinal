import { CreateMLCEngine, MLCEngine, InitProgressCallback } from "@mlc-ai/web-llm";


const SELECTED_MODEL = "Llama-3.2-1B-Instruct-q4f16_1-MLC";
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
    console.log("Booting Local WebLLM Engine: ", SELECTED_MODEL);
    const engine = await CreateMLCEngine(SELECTED_MODEL, { initProgressCallback });
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
  const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/); // Matches JSON objects or arrays
  if (!match) return null;

  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

export async function generateCustomMission(language: string, level: string, history: string, updateProgress?: InitProgressCallback) {
  try {
    const engine = await getLocalEngine(updateProgress);

    // We enforce JSON format by instructing Phi-3 heavily
    const prompt = `You are an expert programming tutor.

The student has the following weaknesses:
${history || "No history"}

Create a coding exercise that specifically targets ONE weakness.

Rules:
- Be clear and short
- Focus on one concept only
- Do NOT give the solution
- Make it slightly challenging

Return ONLY JSON:
{
  "title": "",
  "description": "",
  "starterCode": ""
}`;

    const reply = await engine.chat.completions.create({
      messages: [
        { role: "system", content: "You output pure JSON only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const text = reply.choices[0].message.content || "";
    return safeParse<{ title: string, description: string, starterCode: string }>(text);
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
      max_tokens: 800,
    });

    const text = reply.choices[0].message.content || "";

    const parsed = safeParse<T>(text);
    if (!parsed) {
      console.warn("AI returned invalid JSON → using fallback. Raw text:", text);
      return null;
    }
    return parsed;
  } catch (error) {
    console.error("Local AI Generation Error:", error);
    return null;
  }
}
