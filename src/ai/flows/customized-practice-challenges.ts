'use server';
/**
 * @fileOverview A Genkit flow for generating customized coding challenges based on user weaknesses.
 *
 * - generateCustomizedChallenge - A function that generates a personalized coding challenge.
 * - CustomizedChallengeInput - The input type for the generateCustomizedChallenge function.
 * - CustomizedChallengeOutput - The return type for the generateCustomizedChallenge function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CustomizedChallengeInputSchema = z.object({
  identifiedWeaknesses: z
    .string()
    .describe(
      'A comma-separated list or description of the user\'s programming weaknesses or areas they need to practice (e.g., "recursion, dynamic programming, error handling").'
    ),
  programmingLanguage: z
    .string()
    .optional()
    .describe('The preferred programming language for the challenge (e.g., "Python", "JavaScript", "Java").'),
});
export type CustomizedChallengeInput = z.infer<typeof CustomizedChallengeInputSchema>;

const CustomizedChallengeOutputSchema = z.object({
  challengeTitle: z.string().describe('The title of the coding challenge.'),
  challengeDescription: z
    .string()
    .describe('A brief description explaining the purpose and scope of the challenge.'),
  problemStatement: z.string().describe('The detailed problem statement for the coding challenge.'),
  inputExamples: z
    .array(z.string())
    .describe('An array of example inputs for the challenge.'),
  outputExamples: z
    .array(z.string())
    .describe('An array of corresponding expected outputs for the challenge\'s input examples.'),
  hints: z
    .array(z.string())
    .optional()
    .describe('An optional array of hints to help the user solve the challenge.'),
});
export type CustomizedChallengeOutput = z.infer<typeof CustomizedChallengeOutputSchema>;

export async function generateCustomizedChallenge(
  input: CustomizedChallengeInput
): Promise<CustomizedChallengeOutput> {
  try {
    return await customizedChallengeFlow(input);
  } catch (e: any) {
    console.error("🔥🔥 REAL GENKIT ERROR: 🔥🔥", e?.message || e);
    throw new Error(e?.message || "Genkit flow failed");
  }
}

const challengePrompt = ai.definePrompt({
  name: 'customizedChallengePrompt',
  input: {schema: CustomizedChallengeInputSchema},
  output: {schema: CustomizedChallengeOutputSchema},
  prompt: `You are an experienced programming instructor. Your goal is to create a customized coding challenge for a user.

Generate a coding challenge that specifically targets the following weaknesses identified in the user's performance: {{{identifiedWeaknesses}}}.

{{#if programmingLanguage}}
The challenge should primarily be solvable using the {{programmingLanguage}} programming language.
{{/if}}

Ensure the challenge has a clear problem statement, provides concrete input examples, and their corresponding expected outputs. Optionally, provide some helpful hints.

Structure your response strictly in the requested JSON format, ensuring all fields are populated correctly.
`,
});

const customizedChallengeFlow = ai.defineFlow(
  {
    name: 'customizedChallengeFlow',
    inputSchema: CustomizedChallengeInputSchema,
    outputSchema: CustomizedChallengeOutputSchema,
  },
  async input => {
    const {output} = await challengePrompt(input);
    return output!;
  }
);
