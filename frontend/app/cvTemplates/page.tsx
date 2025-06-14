import { getCVTemplates } from '@/api/cvapi';
import HeaderCVSection from '@/components/sections/header-pagecvTemplate-section';
import dynamic from 'next/dynamic';

const TemplateCVSection = dynamic(
  () => import('@/components/sections/pageCVTemplate-section'),
  { ssr: false }
);

export default async function CLTemplatePage() {
  const cvTemplates = await getCVTemplates();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <HeaderCVSection />
        <TemplateCVSection/>
      </div>
    </div>
  );
}
