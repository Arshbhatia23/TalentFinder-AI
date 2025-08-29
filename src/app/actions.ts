"use server";

import { aiPoweredResumeScreening } from "@/ai/flows/ai-powered-resume-screening";
import type { AiPoweredResumeScreeningInput } from "@/ai/flows/ai-powered-resume-screening";

export async function screenResume(input: AiPoweredResumeScreeningInput) {
  try {
    const result = await aiPoweredResumeScreening(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error screening resume:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: errorMessage };
  }
}
