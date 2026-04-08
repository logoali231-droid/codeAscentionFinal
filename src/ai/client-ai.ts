import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";

/**
 * Client-side AI utility using direct Google Generative AI SDK.
 * This ensures compatibility with standalone APKs and environments without a Node.js server.
 */

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyAQB64iuXlVOH8sBsp1PPV5ehC6bGTf7-g";

if (!API_KEY && typeof window !== 'undefined') {
  console.warn("NEXT_PUBLIC_GEMINI_API_KEY is missing. AI features will not work.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Define the strict schema for "LocalBrain" feedback with explicit typing
const feedbackSchema: Schema = {
  description: "Structured feedback for coding exercises",
  type: SchemaType.OBJECT,
  properties: {
    isCorrect: { type: SchemaType.BOOLEAN },
    feedbackSummary: { type: SchemaType.STRING },
    errorsFound: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          line: { type: SchemaType.NUMBER },
          message: { type: SchemaType.STRING },
          explanation: { type: SchemaType.STRING },
        },
        required: ["message", "explanation"],
      },
    },
    suggestions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          type: { type: SchemaType.STRING },
          message: { type: SchemaType.STRING },
          explanation: { type: SchemaType.STRING },
          codeSnippet: { type: SchemaType.STRING },
          severity: { type: SchemaType.STRING },
        },
        required: ["type", "message", "explanation", "severity"],
      },
    },
    improvedCodeSnippet: { type: SchemaType.STRING },
  },
  required: ["isCorrect", "feedbackSummary", "errorsFound", "suggestions"],
};

export const getClientAiModel = (modelName: string = "gemini-1.5-flash") => {
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: feedbackSchema,
      temperature: 0.1,
    }
  });
};

export function safeParse<T>(text: string): T | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

export async function generateStructuredAIOutput<T>(prompt: string, modelName: string = "gemini-1.5-flash") {
  try {
    const model = getClientAiModel(modelName);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const parsed = safeParse<T>(text);
    if (!parsed) {
      console.warn("AI returned invalid JSON → using fallback");
      return null;
    }
    return parsed;
  } catch (error) {
    console.error("Client AI Generation Error:", error);
    return null;
  }
}
