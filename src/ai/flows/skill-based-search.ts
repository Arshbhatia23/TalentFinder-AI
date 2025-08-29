'use server';
/**
 * @fileOverview Implements the Skill-Based Candidate Search flow.
 *
 * This flow takes a job description and a list of existing candidates,
 * then re-ranks the candidates based on their match to the new job description.
 *
 * - searchCandidates - The main function to perform the search.
 * - SearchCandidatesInput - The input type for the searchCandidates function.
 * - SearchCandidatesOutput - The return type for the searchCandidates function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Candidate } from '@/lib/types';

// We can't pass complex objects with methods into Genkit schemas,
// so we define a simpler version of the Candidate type for the schema.
const CandidateSchema = z.object({
  id: z.string(),
  name: z.string(),
  resumeText: z.string(),
  screeningResult: z.object({
    matchScore: z.number(),
    strengths: z.array(z.string()),
    missingSkills: z.array(z.string()),
    summary: z.array(z.string()),
  }),
});

const SearchCandidatesInputSchema = z.object({
  jobDescription: z.string().describe('The job description to screen against.'),
  candidates: z
    .array(CandidateSchema)
    .describe('An array of candidate objects to be re-ranked.'),
});
export type SearchCandidatesInput = z.infer<typeof SearchCandidatesInputSchema>;

const SearchCandidatesOutputSchema = z.object({
  rankedCandidates: z
    .array(CandidateSchema)
    .describe(
      'The list of candidates, re-ranked based on their match score for the new job description.'
    ),
});
export type SearchCandidatesOutput = z.infer<typeof SearchCandidatesOutputSchema>;

export async function searchCandidates(
  input: SearchCandidatesInput
): Promise<SearchCandidatesOutput> {
  return searchCandidatesFlow(input);
}

const searchCandidatesFlow = ai.defineFlow(
  {
    name: 'searchCandidatesFlow',
    inputSchema: SearchCandidatesInputSchema,
    outputSchema: SearchCandidatesOutputSchema,
  },
  async ({ jobDescription, candidates }) => {
    // This flow will re-evaluate each candidate against the new job description.
    // To improve performance, we can run these evaluations in parallel.
    const promises = candidates.map(async (candidate) => {
      const { output } = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        prompt: `You are an AI-powered resume screening tool. Your task is to re-evaluate a candidate's resume against a NEW job description.

        Provide a match score (0-100), identify missing skills, list strengths, and provide a summary of the resume in the context of the new job description. The summary should be a list of bullet points.

        Resume:
        ${candidate.resumeText}

        New Job Description:
        ${jobDescription}
        `,
        output: {
          schema: z.object({
            matchScore: z.number().describe('A score indicating how well the resume matches the job description (0-100).'),
            missingSkills: z.array(z.string()).describe('A list of skills missing from the resume that are required in the job description.'),
            strengths: z.array(z.string()).describe('A list of strengths highlighted in the resume that align with the job description.'),
            summary: z.array(z.string()).describe('A summary of the resume in relation to the job description, as a list of bullet points.'),
          })
        }
      });

      if (!output) {
        // If the AI fails for one candidate, return the original candidate data
        // so we don't lose them from the list.
        return candidate;
      }
      
      const newScreeningResult = output;

      return {
        ...candidate,
        screeningResult: newScreeningResult,
      };
    });

    const updatedCandidates: Candidate[] = await Promise.all(promises);

    // Sort the candidates by the new match score in descending order.
    const rankedCandidates = updatedCandidates.sort(
      (a, b) => b.screeningResult.matchScore - a.screeningResult.matchScore
    );

    return { rankedCandidates };
  }
);
