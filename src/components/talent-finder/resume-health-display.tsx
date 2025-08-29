'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { ResumeHealthResult } from '@/lib/types';
import { checkResumeHealth } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, FileText, Sparkles, BrainCircuit, Dot } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const formSchema = z.object({
  resumeFile: z.instanceof(File, { message: 'Please upload a resume file.' })
    .refine(file => file.size > 0, 'Please upload a resume file.'),
});
type FormValues = z.infer<typeof formSchema>;

interface ResumeHealthDisplayProps {
  onHealthCheckComplete: (result: ResumeHealthResult) => void;
  result: ResumeHealthResult | null;
}

const ScoreBar = ({ label, score }: { label: string; score: number }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
            <span className="text-sm font-semibold text-primary">{score}%</span>
        </div>
        <Progress value={score} className="h-2" />
    </div>
);


export default function ResumeHealthDisplay({ onHealthCheckComplete, result }: ResumeHealthDisplayProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        resumeFile: undefined,
    }
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);

    const formData = new FormData();
    if (data.resumeFile) {
      formData.append('resumeFile', data.resumeFile);
    }

    const res = await checkResumeHealth(formData);
    setIsLoading(false);

    if (res.success && res.data) {
      toast({
        title: 'Health Check Successful',
        description: 'Your resume analysis is ready.',
      });
      onHealthCheckComplete(res.data);
    } else {
      toast({
        variant: 'destructive',
        title: 'Health Check Failed',
        description: res.error || 'An unexpected error occurred.',
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-4">
      <div className="lg:col-span-2">
        <Card className="sticky top-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-primary" />
              Check Resume Health
            </CardTitle>
            <CardDescription>
              Get an instant ATS score and feedback on your resume's grammar, spelling, and formatting.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="resumeFile"
                  render={({ field: { onChange, ...rest } }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Upload Your Resume
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                            <Input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept=".pdf,.docx"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    onChange(file);
                                    setFileName(file ? file.name : '');
                                }}
                                {...rest}
                            />
                            <div className="flex items-center justify-center w-full h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50">
                                <div className="text-center">
                                    <Upload className="mx-auto h-8 w-8 text-muted-foreground"/>
                                    {fileName ? (
                                        <p className="mt-2 text-sm text-foreground">{fileName}</p>
                                    ) : (
                                        <>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-muted-foreground">PDF or DOCX</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Check My Resume'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-3">
        <Card>
            <CardHeader>
                <CardTitle>Analysis Result</CardTitle>
                <CardDescription>
                    Your resume's ATS-friendliness and overall quality analysis.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && (
                    <div className="space-y-8">
                        <div className="flex justify-center">
                            <Skeleton className="h-40 w-40 rounded-full" />
                        </div>
                        <div className="space-y-6">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-1/2" />
                        </div>
                    </div>
                )}
                {!isLoading && !result && (
                    <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
                        <BrainCircuit className="h-24 w-24 text-muted-foreground/50" />
                        <h3 className="text-xl font-semibold mt-4">Resume Analysis</h3>
                        <p className="text-muted-foreground">Upload your resume to see the health check results.</p>
                    </div>
                )}
                {!isLoading && result && (
                    <div className="space-y-6">
                        <div className="flex justify-center items-center">
                            <div
                                className="radial-progress text-accent"
                                style={{ "--value": result.atsScore, "--size": "12rem", "--thickness": "1rem" } as React.CSSProperties}
                                role="progressbar"
                            >
                                <div className="flex flex-col items-center">
                                    <span className="text-4xl font-bold">{result.atsScore}</span>
                                    <span className="text-sm font-medium text-muted-foreground">Overall Score</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ScoreBar label="Grammar & Spelling" score={result.grammarScore} />
                            <ScoreBar label="Formatting & Structure" score={result.formattingScore} />
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-3">Actionable Feedback</h3>
                            <div className="text-sm text-muted-foreground bg-secondary/50 p-4 rounded-md space-y-2">
                                <ul className="space-y-2">
                                    {result.feedback.map((point, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <Dot className="h-5 w-5 mt-0.5 shrink-0 text-accent" />
                                        <span>{point}</span>
                                    </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
