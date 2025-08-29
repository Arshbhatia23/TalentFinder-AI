'use server';
/**
 * @fileOverview Implements the AI-Powered Resume Screening flow.
 *
 * - aiPoweredResumeScreening - A function that screens a resume against a job description and provides a match score, missing skills, and strengths.
 * - AiPoweredResumeScreeningInput - The input type for the aiPoweredResumeScreening function.
 * - AiPoweredResumeScreeningOutput - The return type for the aiPoweredResumeScreening function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiPoweredResumeScreeningInputSchema = z.object({
  resumeText: z.string().describe('The text extracted from the resume.'),
  jobDescription: z.string().describe('The job description to screen the resume against.'),
});
export type AiPoweredResumeScreeningInput = z.infer<typeof AiPoweredResumeScreeningInputSchema>;

const AiPoweredResumeScreeningOutputSchema = z.object({
  matchScore: z.number().describe('A score indicating how well the resume matches the job description (0-100).'),
  missingSkills: z.array(z.string()).describe('A list of skills missing from the resume that are required in the job description.'),
  strengths: z.array(z.string()).describe('A list of strengths highlighted in the resume that align with the job description.'),
  summary: z.array(z.string()).describe('A summary of the resume in relation to the job description, as a list of bullet points.'),
});
export type AiPoweredResumeScreeningOutput = z.infer<typeof AiPoweredResumeScreeningOutputSchema>;

export async function aiPoweredResumeScreening(
  input: AiPoweredResumeScreeningInput
): Promise<AiPoweredResumeScreeningOutput> {
  return aiPoweredResumeScreeningFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPoweredResumeScreeningPrompt',
  input: {schema: AiPoweredResumeScreeningInputSchema},
  output: {schema: AiPoweredResumeScreeningOutputSchema},
  prompt: `You are an AI-powered resume screening tool. Your task is to evaluate a candidate's resume against a given job description.

  Provide a match score (0-100), identify missing skills, list strengths, and provide a summary of the resume in the context of the job description. The summary should be a list of bullet points.

  Resume:
  {{resumeText}}

  Job Description:
  {{jobDescription}}`,
});

const aiPoweredResumeScreeningFlow = ai.defineFlow(
  {
    name: 'aiPoweredResumeScreeningFlow',
    inputSchema: AiPoweredResumeScreeningInputSchema,
    outputSchema: AiPoweredResumeScreeningOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
