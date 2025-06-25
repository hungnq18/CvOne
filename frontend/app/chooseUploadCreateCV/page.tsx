// app/chooseCreateCV/page.tsx

import dynamic from 'next/dynamic';

// Dynamic import giúp tránh lỗi hydration mismatch
const PageChooseUploadCreateCVSection = dynamic(() => import('@/components/sections/pageChooseUploadCreateCV-section'), {
  ssr: false,
});

export default function ChooseUploadCreateCVPage() {
  return (
    <main className="min-h-screen pt-10 overflow-x-hidden">
      <PageChooseUploadCreateCVSection />
    </main>
  );
}
