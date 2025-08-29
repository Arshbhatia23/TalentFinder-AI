'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Candidate } from '@/lib/types';
import { searchExistingCandidates } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Briefcase, UserRound, Users } from 'lucide-react';
import ScreeningResultDisplay from './screening-result-display';
import CandidateList from './candidate-list';

const formSchema = z.object({
  jobDescription: z.string().min(50, 'Job description must be at least 50 characters.'),
});

type FormValues = z.infer<typeof formSchema>;

interface CandidateSearchProps {
  candidates: Candidate[];
  onSelectCandidate: (candidate: Candidate) => void;
  selectedCandidateId?: string | null;
  onSearchResults: (results: Candidate[]) => void;
}

const exampleJD = `Lead Product Manager

We're looking for an experienced Lead Product Manager to guide the future of our flagship product. You will own the product roadmap, define features, and work with cross-functional teams to deliver an exceptional user experience.

Responsibilities:
- Define product strategy and roadmap
- Gather and prioritize product and customer requirements
- Work closely with engineering, design, marketing, and sales teams
- Analyze market trends and competitive landscape

Qualifications:
- 7+ years of product management experience
- Proven track record of managing all aspects of a successful product throughout its lifecycle
- Solid technical background with understanding and/or hands-on experience in software development and web technologies
- Excellent written and verbal communication skills`;

export default function CandidateSearch({
  candidates,
  onSelectCandidate,
  selectedCandidateId,
  onSearchResults,
}: CandidateSearchProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [totalCandidates, setTotalCandidates] = useState(0);

  // We don't need to fetch candidates here anymore as the action does it.
  // This component will just trigger the search.
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobDescription: exampleJD,
    },
  });
  
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setHasSearched(false);

    const formData = new FormData();
    formData.append('jobDescription', data.jobDescription);
    // We no longer pass candidates from the client
    // formData.append('candidates', JSON.stringify(candidates));

    const result = await searchExistingCandidates(formData);
    setIsLoading(false);
    setHasSearched(true);

    if (result.success && result.data) {
      toast({
        title: 'Search Complete',
        description: `Found and ranked ${result.data.length} candidates.`,
      });
      onSearchResults(result.data);
      setTotalCandidates(result.data.length);
    } else {
      toast({
        variant: 'destructive',
        title: 'Search Failed',
        description: result.error || 'An unexpected error occurred.',
      });
    }
  };

  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId) ?? null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-4">
      <div className="lg:col-span-2">
        <Card className="sticky top-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="text-primary" />
              Find Best Candidate
            </CardTitle>
            <CardDescription>
              Search your entire talent pool against a new job description.
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
                        <Briefcase className="h-4 w-4" /> New Job Description
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
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search All Candidates
                    </>
                  )}
                </Button>
                {hasSearched && totalCandidates === 0 && (
                  <p className="text-xs text-center text-muted-foreground pt-2">
                    No candidates found in the database.
                  </p>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-3">
        <div className="space-y-8">
            <ScreeningResultDisplay result={selectedCandidate?.screeningResult ?? null} isLoading={isLoading} />
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="text-primary" />
                        Ranked Candidates ({candidates.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <CandidateList
                        candidates={candidates}
                        onSelectCandidate={onSelectCandidate}
                        selectedCandidateId={selectedCandidateId}
                    />
                    {hasSearched && candidates.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No matching candidates found for this job description.</p>
                        </div>
                    )}
                     {!hasSearched && candidates.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>Click "Search All Candidates" to begin.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
