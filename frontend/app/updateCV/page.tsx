// app/updateCV/page.tsx

import dynamic from 'next/dynamic';

// Dynamic import giúp tránh lỗi hydration mismatch
const PageUpdateCVSection = dynamic(() => import('@/components/sections/pageUpdateCV-section'), {
  ssr: false,
});

export default function UpdateCVPage() {
  return (
    <main className="min-h-screen bg-blue-50 pt-10 overflow-x-hidden">
      <PageUpdateCVSection />
    </main>
  );
}
