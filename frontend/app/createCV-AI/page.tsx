// app/createCV-AI/page.tsx

import dynamic from 'next/dynamic';

// Dynamic import giúp tránh lỗi hydration mismatch
const PageCreateCVwithAISection = dynamic(() => import('@/components/sections/pageCreateCVwithAI-section'), {
  ssr: false,
});

export default function CreateCVwithAIPage() {
  return (
    <main className="min-h-screen bg-blue-50 pt-10 overflow-x-hidden">
      <PageCreateCVwithAISection />
    </main>
  );
}
