import type { Candidate } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TrendingUp, User } from 'lucide-react';

interface CandidateCardProps {
  candidate: Candidate;
  onSelect: () => void;
  isSelected: boolean;
}

export default function CandidateCard({ candidate, onSelect, isSelected }: CandidateCardProps) {
  const { name, screeningResult } = candidate;
  const topStrengths = screeningResult.strengths.slice(0, 3);
  
  return (
    <Card
      onClick={onSelect}
      className={cn(
        'cursor-pointer transition-all hover:shadow-lg hover:border-primary',
        isSelected && 'border-primary ring-2 ring-primary'
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="h-5 w-5 text-muted-foreground" />
          <span className="truncate">{name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Match Score
            </div>
            <span className="text-xl font-bold text-primary">{screeningResult.matchScore}%</span>
        </div>
        <div>
          <h4 className="text-xs font-semibold mb-2 text-muted-foreground">Top Strengths</h4>
          <div className="flex flex-wrap gap-1.5">
            {topStrengths.length > 0 ? (
                topStrengths.map((strength, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">{strength}</Badge>
                ))
            ) : (
                <p className="text-xs text-muted-foreground">No specific strengths found.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
