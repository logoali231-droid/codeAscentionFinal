import { CreateMLCEngine, MLCEngine, InitProgressCallback } from "@mlc-ai/web-llm";

// Qwen2.5-Coder is specifically trained on code — far smarter than Phi-3 for a coding tutor.
// Free, open source. ~4.5GB first-time download, cached permanently after.
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
    const prompt = `You are LocalBrain, an expert programming tutor in a sci-fi cyber training simulator.
Generate a coding mission for the language: ${language}.
The difficulty level is: Phase ${level} (where 1 is absolute basics like variables, and 5 is data structures).

User Training History / Weaknesses:
${history || "No history. This is their first attempt."}

INSTRUCTIONS:
1. Create a very short, engaging sci-fi themed objective (2-3 sentences max).
2. If they have history, specifically test them on a concept they recently failed.
3. Provide starter code in ${language} that has a clear place for them to write their solution.

CRITICAL: Output ONLY a valid JSON object matching this schema. NO markdown backticks, NO other text.
{
  "title": "Mission Title",
  "description": "Short sci-fi objective.",
  "starterCode": "// write code here"
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

    const maxedPrompt = `${prompt}
    
CRITICAL INSTRUCTION: Output ONLY a valid JSON object. No markdown backticks, no conversational text.
Expected JSON Schema keys: "isCorrect", "feedbackSummary", "errorsFound", "suggestions".`;

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
