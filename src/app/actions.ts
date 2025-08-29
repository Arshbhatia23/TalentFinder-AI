'use server';

import { aiPoweredResumeScreening } from '@/ai/flows/ai-powered-resume-screening';
import type { AiPoweredResumeScreeningInput } from '@/ai/flows/ai-powered-resume-screening';
import { extractTextFromFile } from '@/ai/flows/extract-text-from-file';
import type { ExtractTextFromFileInput } from '@/ai/flows/extract-text-from-file';
import { resumeHealthCheck } from '@/ai/flows/resume-health-check';
import type { ResumeHealthCheckInput } from '@/ai/flows/resume-health-check';
import { searchCandidates } from '@/ai/flows/skill-based-search';
import type { Candidate } from '@/lib/types';
import clientPromise from '@/lib/mongodb';
import { CollectionName } from '@/lib/collections';

async function getResumeText(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    const input: ExtractTextFromFileInput = { fileDataUri: dataUri };
    const result = await extractTextFromFile(input);
    return result.text;
}

export async function screenResume(formData: FormData) {
  try {
    const jobDescription = formData.get('jobDescription') as string;
    const resumeFile = formData.get('resumeFile') as File | null;

    if (!resumeFile || resumeFile.size === 0) {
      return { success: false, error: "Resume is missing. Please upload a resume." };
    }

    const resumeText = await getResumeText(resumeFile);
    const resumeName = resumeFile.name;
    
    // Save the resume to MongoDB
    const client = await clientPromise;
    const db = client.db();
    await db.collection(CollectionName.Resumes).insertOne({
      name: resumeName,
      resumeText,
      fileName: resumeFile.name,
      createdAt: new Date(),
    });

    const screeningInput: AiPoweredResumeScreeningInput = { jobDescription, resumeText };
    const screeningResult = await aiPoweredResumeScreening(screeningInput);
    
    return { success: true, data: { ...screeningResult, resumeName, resumeText } };
  } catch (error) {
    console.error("Error screening resume:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: errorMessage };
  }
}

export async function checkResumeHealth(formData: FormData) {
  try {
    const resumeFile = formData.get('resumeFile') as File | null;

    if (!resumeFile || resumeFile.size === 0) {
      return { success: false, error: "Resume is missing. Please upload a resume." };
    }

    const resumeText = await getResumeText(resumeFile);
    const input: ResumeHealthCheckInput = { resumeText };
    const result = await resumeHealthCheck(input);

    return { success: true, data: result };
  } catch (error) {
    console.error("Error checking resume health:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: errorMessage };
  }
}

export async function searchExistingCandidates(formData: FormData) {
  try {
    const jobDescription = formData.get('jobDescription') as string;
    
    const client = await clientPromise;
    const db = client.db();
    const resumeDocs = await db.collection(CollectionName.Resumes).find({}).toArray();

    if (resumeDocs.length === 0) {
      return { success: true, data: [] };
    }

    // Transform the documents from the DB into the Candidate shape the flow expects.
    // The initial screeningResult can be empty as it will be re-calculated by the flow.
    const candidates: Candidate[] = resumeDocs.map(doc => ({
      id: doc._id.toString(),
      name: doc.name,
      resumeText: doc.resumeText,
      screeningResult: {
        matchScore: 0,
        strengths: [],
        missingSkills: [],
        summary: [],
      }
    }));
    
    const result = await searchCandidates({
      jobDescription,
      candidates,
    });

    return { success: true, data: result.rankedCandidates };
  } catch (error) {
    console.error('Error searching candidates:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: errorMessage };
  }
}

export async function submitResume(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const resumeFile = formData.get('resumeFile') as File | null;

    if (!resumeFile || resumeFile.size === 0) {
      return { success: false, error: 'Resume file is required.' };
    }
     if (!name) {
      return { success: false, error: 'Name is required.' };
    }

    const resumeText = await getResumeText(resumeFile);
    
    const client = await clientPromise;
    const db = client.db();
    
    await db.collection(CollectionName.Resumes).insertOne({
      name,
      resumeText,
      fileName: resumeFile.name,
      createdAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error submitting resume:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: errorMessage };
  }
}
