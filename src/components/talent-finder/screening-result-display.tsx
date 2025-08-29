"use client";

import type { ScreeningResult } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ThumbsUp, ThumbsDown, FileSignature, BarChart, BrainCircuit, Dot } from 'lucide-react';

interface ScreeningResultDisplayProps {
  result: ScreeningResult | null;
  isLoading: boolean;
}

const LoadingState = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent className="space-y-8">
      <div className="flex justify-center">
        <Skeleton className="h-40 w-40 rounded-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/4" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/4" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </CardContent>
  </Card>
);

const EmptyState = () => (
    <Card className="flex flex-col items-center justify-center min-h-[500px] text-center">
        <CardContent className="space-y-4">
            <div className="flex justify-center">
                <BrainCircuit className="h-24 w-24 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold">AI Analysis Results</h3>
            <p className="text-muted-foreground">
                Screen a candidate to see the detailed analysis here.
            </p>
        </CardContent>
    </Card>
);


export default function ScreeningResultDisplay({ result, isLoading }: ScreeningResultDisplayProps) {
  if (isLoading) return <LoadingState />;
  if (!result) return <EmptyState />;

  const { matchScore, strengths, missingSkills, summary } = result;

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-success-content';
    if (score >= 50) return 'text-warning-content';
    return 'text-error-content';
  };
  
  const getScoreBgColor = (score: number) => {
    if (score >= 75) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <BarChart className="text-primary" />
            Screening Result
        </CardTitle>
        <CardDescription>AI-powered analysis of the candidate's profile against the job description.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center items-center">
          <div 
            className="radial-progress text-primary" 
            style={{"--value": matchScore, "--size": "12rem", "--thickness": "1rem"} as React.CSSProperties}
            role="progressbar"
          >
            <div className="flex flex-col items-center">
                <span className="text-4xl font-bold">{matchScore}</span>
                <span className="text-sm font-medium text-muted-foreground">Match Score</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><ThumbsUp className="text-green-500"/>Strengths</h3>
              <div className="flex flex-wrap gap-2">
                {strengths.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 border-green-200">{skill}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><ThumbsDown className="text-red-500"/>Missing Skills</h3>
              <div className="flex flex-wrap gap-2">
                {missingSkills.map((skill, index) => (
                  <Badge key={index} variant="destructive" className="bg-red-100 text-red-800 border-red-200">{skill}</Badge>
                ))}
              </div>
            </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><FileSignature className="text-primary"/>AI Summary</h3>
          <div className="text-sm text-muted-foreground bg-secondary/50 p-4 rounded-md space-y-2">
            {Array.isArray(summary) ? (
              <ul className="space-y-2">
                {summary.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Dot className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>{summary}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
