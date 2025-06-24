// app/createCV/page.tsx

import dynamic from 'next/dynamic';

// Dynamic import giúp tránh lỗi hydration mismatch
const UploadCVPage = dynamic(
  () => import("@/components/sections/pageUploadCV-section"),
  {
    ssr: false,
  }
);

export default function CreateCVPage() {
  return (
    <main className="min-h-screen bg-blue-50 pt-10 overflow-x-hidden">
      <UploadCVPage />
    </main>
  );
}
