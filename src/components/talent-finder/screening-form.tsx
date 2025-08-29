"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, FileText, Briefcase, Loader2, Upload } from 'lucide-react';
import { screenResume } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { Candidate } from '@/lib/types';

const formSchema = z.object({
  jobDescription: z.string().min(50, 'Job description must be at least 50 characters.'),
  resumeFile: z.instanceof(File, { message: 'Please upload a resume file.' })
    .refine(file => file.size > 0, 'Please upload a resume file.'),
});

type FormValues = z.infer<typeof formSchema>;

interface ScreeningFormProps {
  onScreeningComplete: (candidate: Candidate) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const exampleJD = `Senior Frontend Engineer (React)

We are looking for an experienced Senior Frontend Engineer to join our team. The ideal candidate will have a strong background in building complex web applications with React, TypeScript, and modern frontend technologies.

Responsibilities:
- Develop and maintain user-facing features using React.js
- Build reusable components and front-end libraries for future use
- Translate designs and wireframes into high-quality code
- Optimize components for maximum performance across a vast array of web-capable devices and browsers
- Work with product managers and designers to create a seamless user experience.

Qualifications:
- 5+ years of experience in frontend development
- Proficient in React, TypeScript, and Redux
- Experience with RESTful APIs and modern authorization mechanisms
- Strong understanding of web performance and optimization techniques
- Familiarity with modern front-end build pipelines and tools (e.g., Webpack, Babel, NPM)`;

export default function ScreeningForm({ onScreeningComplete, isLoading, setIsLoading }: ScreeningFormProps) {
  const { toast } = useToast();
  const [fileName, setFileName] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobDescription: exampleJD,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append('jobDescription', data.jobDescription);
    if (data.resumeFile) {
      formData.append('resumeFile', data.resumeFile);
    }

    const result = await screenResume(formData);
    setIsLoading(false);

    if (result.success && result.data) {
      toast({
        title: 'Screening Successful',
        description: 'Candidate analysis is ready.',
      });
      const newCandidate: Candidate = {
        id: new Date().toISOString(),
        name: result.data.resumeName,
        resumeText: result.data.resumeText,
        screeningResult: {
            matchScore: result.data.matchScore,
            strengths: result.data.strengths,
            missingSkills: result.data.missingSkills,
            summary: result.data.summary,
        },
      };
      onScreeningComplete(newCandidate);
      form.reset({ jobDescription: data.jobDescription, resumeFile: undefined });
      setFileName('');
    } else {
      toast({
        variant: 'destructive',
        title: 'Screening Failed',
        description: result.error || 'An unexpected error occurred.',
      });
    }
  };

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="text-primary" />
          New Screening
        </CardTitle>
        <CardDescription>
          Enter a job description and upload a resume to get an AI-powered analysis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="jobDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" /> Job Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste the job description here..."
                      className="min-h-[200px] text-xs"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="resumeFile"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Candidate Resume
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
                  Screening...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Screen Candidate
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
