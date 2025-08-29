
import CandidateSubmissionForm from '@/components/talent-finder/candidate-submission-form';
import Header from '@/components/talent-finder/header';

export default function SubmitResumePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <CandidateSubmissionForm />
        </div>
      </main>
    </div>
  );
}
