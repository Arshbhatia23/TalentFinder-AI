'use server';

import { config } from 'dotenv';
config();

import '@/ai/flows/resume-summary-generator.ts';
import '@/ai/flows/ai-powered-resume-screening.ts';
import '@/ai/flows/extract-text-from-file.ts';
import '@/ai/flows/resume-health-check.ts';
