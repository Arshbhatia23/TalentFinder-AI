'use server';
/**
 * @fileOverview Implements the Resume Health Check flow.
 *
 * This flow analyzes a resume for common issues like spelling, grammar, and formatting,
 * providing an overall score and actionable feedback for improvement. It does not
 * require a job description.
 *
 * - resumeHealthCheck - A function that performs the health check.
 * - ResumeHealthCheckInput - The input type for the resumeHealthCheck function.
 * - ResumeHealthCheckOutput - The return type for the resumeHealthCheck function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ResumeHealthCheckInputSchema = z.object({
  resumeText: z.string().describe('The text extracted from the resume.'),
});
export type ResumeHealthCheckInput = z.infer<typeof ResumeHealthCheckInputSchema>;

const ResumeHealthCheckOutputSchema = z.object({
  atsScore: z
    .number()
    .describe(
      'An overall score (0-100) representing the resume\'s ATS-friendliness and quality.'
    ),
  grammarScore: z
    .number()
    .describe(
      'A score (0-100) for grammar and spelling.'
    ),
  formattingScore: z
    .number()
    .describe(
      'A score (0-100) for formatting and structure.'
    ),
  feedback: z
    .array(z.string())
    .describe(
      'A list of specific, actionable feedback points to improve the resume, presented as bullet points.'
    ),
});
export type ResumeHealthCheckOutput = z.infer<typeof ResumeHealthCheckOutputSchema>;

export async function resumeHealthCheck(
  input: ResumeHealthCheckInput
): Promise<ResumeHealthCheckOutput> {
  return resumeHealthCheckFlow(input);
}

const prompt = ai.definePrompt({
  name: 'resumeHealthCheckPrompt',
  input: { schema: ResumeHealthCheckInputSchema },
  output: { schema: ResumeHealthCheckOutputSchema },
  prompt: `You are an expert ATS (Applicant Tracking System) and resume reviewer.
  Your task is to analyze the provided resume text and provide a "Resume Health Check".

  Analyze the following areas:
  1.  **Grammar and Spelling**: Check for any errors.
  2.  **Formatting**: Evaluate the clarity, structure, and ATS-friendliness of the format. Look for clear headings, consistent date formats, and readable layout.
  
  Based on your analysis, provide the following:
  -   **atsScore**: An overall score from 0-100 representing the resume's quality and ATS-friendliness.
  -   **grammarScore**: A score from 0-100 for grammar and spelling.
  -   **formattingScore**: A score from 0-100 for formatting and structure.
  -   **feedback**: A list of actionable bullet points for improvement. Be specific and constructive.

  Resume Text:
  {{resumeText}}
  `,
});

const resumeHealthCheckFlow = ai.defineFlow(
  {
    name: 'resumeHealthCheckFlow',
    inputSchema: ResumeHealthCheckInputSchema,
    outputSchema: ResumeHealthCheckOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
