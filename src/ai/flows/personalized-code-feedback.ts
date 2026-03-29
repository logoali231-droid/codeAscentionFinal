'use server';
/**
 * @fileOverview Provides personalized AI feedback on user-submitted code for coding exercises.
 *
 * - personalizedCodeFeedback - A function that handles the generation of personalized code feedback.
 * - PersonalizedCodeFeedbackInput - The input type for the personalizedCodeFeedback function.
 * - PersonalizedCodeFeedbackOutput - The return type for the personalizedCodeFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedCodeFeedbackInputSchema = z.object({
  userCode: z.string().describe('The user-submitted code for the exercise.'),
  exerciseDescription:
    z.string().describe('A description of the coding exercise or problem statement.'),
  language:
    z.string().describe('The programming language of the user code (e.g., "Python", "JavaScript", "Java").'),
});
export type PersonalizedCodeFeedbackInput = z.infer<
  typeof PersonalizedCodeFeedbackInputSchema
>;

const PersonalizedCodeFeedbackOutputSchema = z.object({
  isCorrect:
    z.boolean().describe(
      'True if the code is logically correct and fulfills the exercise requirements, false otherwise.'
    ),
  feedbackSummary:
    z.string().describe(
      'A concise, overall summary of the feedback, highlighting main points.'
    ),
  errorsFound:
    z.array(
      z.object({
        line:
          z.number().optional().describe('The approximate line number where the error occurs.'),
        message:
          z.string().describe('A brief message identifying the error or issue.'),
        explanation:
          z.string().describe('A detailed explanation of why this is an error and its impact.'),
      })
    ).describe('A list of specific errors or critical issues found in the code.'),
  suggestions:
    z.array(
      z.object({
        type:
          z.enum(['readability', 'performance', 'best_practice', 'optimization', 'style', 'logic'])
            .describe('The type of suggestion (e.g., readability, performance, best_practice).'),
        message:
          z.string().describe('A brief message describing the suggestion.'),
        explanation:
          z.string().describe('A detailed explanation of the suggestion and its benefits.'),
        codeSnippet:
          z.string().optional().describe('An optional code snippet demonstrating the suggestion or an improved version.'),
      })
    ).describe('A list of suggestions for improving the code beyond fixing errors.'),
  improvedCodeSnippet:
    z.string().optional().describe(
      'An optional complete improved version of the user code incorporating some of the suggestions, if applicable.'
    ),
});
export type PersonalizedCodeFeedbackOutput = z.infer<
  typeof PersonalizedCodeFeedbackOutputSchema
>;

export async function personalizedCodeFeedback(
  input: PersonalizedCodeFeedbackInput
): Promise<PersonalizedCodeFeedbackOutput> {
  return personalizedCodeFeedbackFlow(input);
}

const personalizedCodeFeedbackPrompt = ai.definePrompt({
  name: 'personalizedCodeFeedbackPrompt',
  input: {schema: PersonalizedCodeFeedbackInputSchema},
  output: {schema: PersonalizedCodeFeedbackOutputSchema},
  prompt: `You are an expert programming tutor designed to provide comprehensive, personalized feedback on user-submitted code.
Your goal is to help the user understand their mistakes, learn efficiently, and improve their coding skills.

The user has submitted code for a coding exercise. Analyze their code for correctness, efficiency, readability, and adherence to best practices.

Here is the exercise description:
{{{exerciseDescription}}}

Here is the user's code written in {{language}}:
\`\`\`{{language}}
{{{userCode}}}
\`\`\`

Based on the exercise description and the user's code, provide feedback in a structured JSON format as described by the output schema.
Be sure to:
1.  Determine if the code is logically correct and meets the exercise requirements. Set 'isCorrect' accordingly.
2.  Provide a 'feedbackSummary' that briefly summarizes the main points of your review.
3.  List all critical 'errorsFound'. For each error, provide the 'line' number (if applicable and estimable), a brief 'message', and a detailed 'explanation' of the error and why it's a problem.
4.  Offer constructive 'suggestions' for improvement, even if the code is correct. These suggestions should cover areas like readability, performance, best practices, or optimizations. For each suggestion, specify its 'type', a 'message', a detailed 'explanation' of the benefit, and optionally an 'codeSnippet' demonstrating the suggestion.
5.  If significant improvements are suggested, provide an 'improvedCodeSnippet' that demonstrates how the code could look after applying key suggestions.

Ensure your tone is encouraging and educational.`,
});

const personalizedCodeFeedbackFlow = ai.defineFlow(
  {
    name: 'personalizedCodeFeedbackFlow',
    inputSchema: PersonalizedCodeFeedbackInputSchema,
    outputSchema: PersonalizedCodeFeedbackOutputSchema,
  },
  async input => {
    const {output} = await personalizedCodeFeedbackPrompt(input);
    return output!;
  }
);
