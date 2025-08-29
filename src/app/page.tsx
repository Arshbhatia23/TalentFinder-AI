"use client";

import { useState } from 'react';
import type { Candidate, ScreeningResult } from '@/lib/types';
import Header from '@/components/talent-finder/header';
import ScreeningForm from '@/components/talent-finder/screening-form';
import ScreeningResultDisplay from '@/components/talent-finder/screening-result-display';
import CandidateList from '@/components/talent-finder/candidate-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { UserSearch } from 'lucide-react';

export default function Home() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleScreeningComplete = (newCandidate: Candidate) => {
    setCandidates(prev => [newCandidate, ...prev]);
    setSelectedCandidate(newCandidate);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <ScreeningForm
              onScreeningComplete={handleScreeningComplete}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </div>
          <div className="lg:col-span-3">
            <ScreeningResultDisplay result={selectedCandidate?.screeningResult ?? null} isLoading={isLoading} />
          </div>
        </div>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserSearch className="text-primary" />
              All Candidates ({candidates.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CandidateList
              candidates={candidates}
              onSelectCandidate={setSelectedCandidate}
              selectedCandidateId={selectedCandidate?.id}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
