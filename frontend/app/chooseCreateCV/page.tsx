// app/chooseCreateCV/page.tsx

import dynamic from 'next/dynamic';

// Dynamic import giúp tránh lỗi hydration mismatch
const PageChooseCreateCVSection = dynamic(() => import('@/components/sections/pageChooseCreateCV-section'), {
  ssr: false,
});

export default function ChooseCreateCVPage() {
  return (
    <main className="min-h-screen pt-10 overflow-x-hidden">
      <PageChooseCreateCVSection />
    </main>
  );
}
