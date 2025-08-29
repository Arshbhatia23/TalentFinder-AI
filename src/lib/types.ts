import type { AiPoweredResumeScreeningOutput } from "@/ai/flows/ai-powered-resume-screening";
import type { ResumeHealthCheckOutput } from "@/ai/flows/resume-health-check";

export type ScreeningResult = AiPoweredResumeScreeningOutput;
export type ResumeHealthResult = ResumeHealthCheckOutput;

export interface Candidate {
  id: string;
  name: string;
  resumeText: string;
  screeningResult: ScreeningResult;
}
