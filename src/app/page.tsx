'use client';

import { useState } from 'react';
import type { Candidate, ScreeningResult, ResumeHealthResult } from '@/lib/types';
import Header from '@/components/talent-finder/header';
import ScreeningForm from '@/components/talent-finder/screening-form';
import ScreeningResultDisplay from '@/components/talent-finder/screening-result-display';
import CandidateSearch from '@/components/talent-finder/candidate-search';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserSearch, ScanSearch, FileCheck2 } from 'lucide-react';
import ResumeHealthDisplay from '@/components/talent-finder/resume-health-display';

export default function Home() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resumeHealthResult, setResumeHealthResult] = useState<ResumeHealthResult | null>(null);
  const [activeTab, setActiveTab] = useState('screening');

  const handleScreeningComplete = (newCandidate: Candidate) => {
    setCandidates(prev => {
      const existingIndex = prev.findIndex(c => c.name === newCandidate.name);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = newCandidate;
        return updated;
      }
      return [newCandidate, ...prev];
    });
    setSelectedCandidate(newCandidate);
    setResumeHealthResult(null);
  };

  const handleHealthCheckComplete = (result: ResumeHealthResult) => {
    setResumeHealthResult(result);
    setSelectedCandidate(null);
  };
  
  const handleSearchResults = (results: Candidate[]) => {
    setCandidates(results);
    if (results.length > 0) {
      setSelectedCandidate(results[0]);
    } else {
      setSelectedCandidate(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="screening">
              <ScanSearch className="mr-2" /> New Screening
            </TabsTrigger>
            <TabsTrigger value="search">
              <UserSearch className="mr-2" /> Candidate Search
            </TabsTrigger>
            <TabsTrigger value="health-check">
              <FileCheck2 className="mr-2" /> Resume Health Check
            </TabsTrigger>
          </TabsList>
          <TabsContent value="screening">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-4">
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
          </TabsContent>
          <TabsContent value="search">
             <CandidateSearch 
                candidates={candidates}
                onSelectCandidate={setSelectedCandidate}
                selectedCandidateId={selectedCandidate?.id}
                onSearchResults={handleSearchResults}
              />
          </TabsContent>
          <TabsContent value="health-check">
            <ResumeHealthDisplay 
              onHealthCheckComplete={handleHealthCheckComplete}
              result={resumeHealthResult}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
