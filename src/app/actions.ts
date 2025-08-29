"use server";

import { aiPoweredResumeScreening } from "@/ai/flows/ai-powered-resume-screening";
import type { AiPoweredResumeScreeningInput } from "@/ai/flows/ai-powered-resume-screening";
import mammoth from 'mammoth';

// Using require for pdf-parse to avoid potential issues with ES module imports in this context.
const pdf = require('pdf-parse');

async function getResumeText(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    if (file.type === 'application/pdf') {
        const data = await pdf(Buffer.from(buffer));
        return data.text;
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const { value } = await mammoth.extractRawText({ buffer });
        return value;
    }
    throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
}

export async function screenResume(formData: FormData) {
  try {
    const jobDescription = formData.get('jobDescription') as string;
    const resumeFile = formData.get('resumeFile') as File | null;
    const resumeTextFromForm = formData.get('resumeText') as string | null;

    let resumeText = '';
    let resumeName = 'Unnamed Candidate';

    if (resumeFile && resumeFile.size > 0) {
        resumeText = await getResumeText(resumeFile);
        resumeName = resumeFile.name;
    } else if (resumeTextFromForm) {
        resumeText = resumeTextFromForm;
        resumeName = resumeTextFromForm.split('\\n')[0].trim() || 'Unnamed Candidate';
    }

    if (!resumeText) {
        return { success: false, error: "Resume is missing." };
    }

    const input: AiPoweredResumeScreeningInput = { jobDescription, resumeText };
    const result = await aiPoweredResumeScreening(input);
    
    return { success: true, data: { ...result, resumeName, resumeText } };
  } catch (error) {
    console.error("Error screening resume:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: errorMessage };
  }
}
