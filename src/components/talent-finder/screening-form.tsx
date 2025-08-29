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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, FileText, Briefcase, Loader2 } from 'lucide-react';
import { screenResume } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { Candidate } from '@/lib/types';

const formSchema = z.object({
  jobDescription: z.string().min(50, 'Job description must be at least 50 characters.'),
  resumeText: z.string().min(50, 'Resume text must be at least 50 characters.'),
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

const exampleResume = `Jane Doe
Senior Frontend Engineer
(123) 456-7890 | jane.doe@email.com | linkedin.com/in/janedoe

Summary
Highly skilled Senior Frontend Engineer with over 7 years of experience in designing, developing, and deploying scalable and performant web applications. Expertise in React, TypeScript, and state management solutions like Redux. Passionate about creating intuitive user interfaces and writing clean, maintainable code.

Experience
Tech Solutions Inc. - Senior Frontend Engineer (2018 - Present)
- Led the development of a new customer-facing dashboard using React and TypeScript, resulting in a 30% increase in user engagement.
- Architected and implemented a reusable component library, reducing development time by 25%.
- Mentored junior engineers and conducted code reviews to ensure high code quality.
- Collaborated with backend teams to integrate with RESTful APIs.

Web Innovators - Frontend Developer (2015 - 2018)
- Developed responsive web applications using React and JavaScript (ES6+).
- Worked in an Agile environment to deliver features on a regular basis.

Skills
- Programming Languages: JavaScript, TypeScript, HTML5, CSS3
- Libraries & Frameworks: React, Redux, Next.js
- Tools: Git, Webpack, Babel, Jest, Cypress`;

export default function ScreeningForm({ onScreeningComplete, isLoading, setIsLoading }: ScreeningFormProps) {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobDescription: exampleJD,
      resumeText: exampleResume,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    const result = await screenResume(data);
    setIsLoading(false);

    if (result.success && result.data) {
      toast({
        title: 'Screening Successful',
        description: 'Candidate analysis is ready.',
      });
      const candidateName = data.resumeText.split('\n')[0].trim() || 'Unnamed Candidate';
      const newCandidate: Candidate = {
        id: new Date().toISOString(),
        name: candidateName,
        resumeText: data.resumeText,
        screeningResult: result.data,
      };
      onScreeningComplete(newCandidate);
      form.reset({ jobDescription: data.jobDescription, resumeText: '' });
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
          Enter a job description and resume to get an AI-powered analysis.
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
              name="resumeText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Candidate Resume
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste the candidate's resume text here..."
                      className="min-h-[200px] text-xs"
                      {...field}
                    />
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
