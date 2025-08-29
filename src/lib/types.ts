import type { AiPoweredResumeScreeningOutput } from "@/ai/flows/ai-powered-resume-screening";

export type ScreeningResult = AiPoweredResumeScreeningOutput;

export interface Candidate {
  id: string;
  name: string;
  resumeText: string;
  screeningResult: ScreeningResult;
}
