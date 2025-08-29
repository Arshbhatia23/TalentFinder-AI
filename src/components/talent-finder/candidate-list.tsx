"use client";

import { useState, useMemo } from 'react';
import type { Candidate } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import CandidateCard from './candidate-card';

interface CandidateListProps {
  candidates: Candidate[];
  onSelectCandidate: (candidate: Candidate) => void;
  selectedCandidateId?: string | null;
}

export default function CandidateList({ candidates, onSelectCandidate, selectedCandidateId }: CandidateListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCandidates = useMemo(() => {
    if (!searchTerm) {
      return candidates;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return candidates.filter(c =>
      c.name.toLowerCase().includes(lowercasedTerm) ||
      c.resumeText.toLowerCase().includes(lowercasedTerm)
    );
  }, [candidates, searchTerm]);
  
  const sortedCandidates = useMemo(() => {
    return [...filteredCandidates].sort((a, b) => b.screeningResult.matchScore - a.screeningResult.matchScore);
  }, [filteredCandidates]);

  if (candidates.length === 0) {
    // This state is now handled in the parent CandidateSearch component
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter ranked candidates by name, skill..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedCandidates.map(candidate => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            onSelect={() => onSelectCandidate(candidate)}
            isSelected={candidate.id === selectedCandidateId}
          />
        ))}
      </div>
    </div>
  );
}
