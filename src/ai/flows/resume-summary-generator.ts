'use server';

/**
 * @fileOverview Generates a tailored resume summary for each candidate, highlighting their key skills and experience in relation to the job description.
 *
 * - generateResumeSummary - A function that generates the resume summary.
 * - GenerateResumeSummaryInput - The input type for the generateResumeSummary function.
 * - GenerateResumeSummaryOutput - The return type for the generateResumeSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateResumeSummaryInputSchema = z.object({
  resumeText: z
    .string()
    .describe('The extracted text content of the resume.'),
  jobDescription: z
    .string()
    .describe('The job description to tailor the summary to.'),
});
export type GenerateResumeSummaryInput = z.infer<typeof GenerateResumeSummaryInputSchema>;

const GenerateResumeSummaryOutputSchema = z.object({
  summary: z.string().describe('A tailored summary of the resume.'),
});
export type GenerateResumeSummaryOutput = z.infer<typeof GenerateResumeSummaryOutputSchema>;

export async function generateResumeSummary(input: GenerateResumeSummaryInput): Promise<GenerateResumeSummaryOutput> {
  return generateResumeSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateResumeSummaryPrompt',
  input: {schema: GenerateResumeSummaryInputSchema},
  output: {schema: GenerateResumeSummaryOutputSchema},
  prompt: `You are an expert resume summarizer. You will generate a concise summary of a candidate's resume, tailored to a specific job description. The summary should highlight the candidate's key skills and experience that are most relevant to the job description.

Job Description: {{{jobDescription}}}

Resume Text: {{{resumeText}}}

Summary:`,
});

const generateResumeSummaryFlow = ai.defineFlow(
  {
    name: 'generateResumeSummaryFlow',
    inputSchema: GenerateResumeSummaryInputSchema,
    outputSchema: GenerateResumeSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
