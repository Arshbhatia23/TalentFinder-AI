'use client';

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
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, FileText, Loader2, Upload, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { submitResume } from '@/app/actions'; 

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  resumeFile: z.instanceof(File, { message: 'Please upload your resume.' })
    .refine(file => file.size > 0, 'Please upload your resume.')
    .refine(file => file.size < 5 * 1024 * 1024, 'File size must be less than 5MB.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function CandidateSubmissionForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      resumeFile: undefined,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append('name', data.name);
    if (data.resumeFile) {
      formData.append('resumeFile', data.resumeFile);
    }
    
    const result = await submitResume(formData);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: 'Submission Successful!',
        description: 'Thank you for submitting your resume. We will be in touch.',
      });
      form.reset();
      setFileName('');
    } else {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: result.error || 'An unexpected error occurred.',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="text-primary" />
          Submit Your Resume
        </CardTitle>
        <CardDescription>
          We are always looking for talented individuals. Upload your resume below to be considered for future opportunities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="h-4 w-4" /> Full Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Jane Doe" {...field} />
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
                    <FileText className="h-4 w-4" /> Your Resume
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                        <Input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            accept=".pdf,.docx"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  onChange(file);
                                  setFileName(file.name);
                                }
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
                                        <p className="text-xs text-muted-foreground">PDF or DOCX (max 5MB)</p>
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
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Application
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
