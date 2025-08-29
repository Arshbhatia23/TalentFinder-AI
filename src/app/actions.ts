"use server";

import { aiPoweredResumeScreening } from "@/ai/flows/ai-powered-resume-screening";
import type { AiPoweredResumeScreeningInput } from "@/ai/flows/ai-powered-resume-screening";
import { extractTextFromFile } from "@/ai/flows/extract-text-from-file";
import type { ExtractTextFromFileInput } from "@/ai/flows/extract-text-from-file";

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
    
    const input: AiPoweredResumeScreeningInput = { jobDescription, resumeText };
    const result = await aiPoweredResumeScreening(input);
    
    return { success: true, data: { ...result, resumeName, resumeText } };
  } catch (error) {
    console.error("Error screening resume:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: errorMessage };
  }
}
