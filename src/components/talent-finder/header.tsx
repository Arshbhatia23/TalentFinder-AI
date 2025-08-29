import { Target } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-card border-b shadow-sm">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              TalentFinder AI
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}
