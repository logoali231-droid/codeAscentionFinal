import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Client-side AI utility using direct Google Generative AI SDK.
 * This ensures compatibility with standalone APKs and environments without a Node.js server.
 */

// For standalone device builds, we ensure the key is always available.
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!API_KEY && typeof window !== 'undefined') {
  console.warn("NEXT_PUBLIC_GEMINI_API_KEY is missing. AI features will not work.");
}

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export const getClientAiModel = (modelName: string = "gemini-2.0-flash") => {
  return genAI.getGenerativeModel({ 
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
    }
  });
};

/**
 * General helper to run a structured prompt on the client.
 */
export async function generateStructuredAIOutput<T>(prompt: string, modelName: string = "gemini-2.0-flash"): Promise<T> {
  try {
    const model = getClientAiModel(modelName);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text) as T;
  } catch (error) {
    console.error("Client AI Generation Error:", error);
    throw error;
  }
}
