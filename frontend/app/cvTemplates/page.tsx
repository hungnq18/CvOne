import { getCVTemplates } from '@/api/cvapi';
import HeaderCVSection from '@/components/sections/header-pagecvTemplate-section';
import NextDynamic from 'next/dynamic';
import AdvertisementSection, { VerticalAdvertisementSection } from '@/components/sections/advertisement-section';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable caching

const TemplateCVSection = NextDynamic(
  () => import('@/components/sections/pageCVTemplate-section'),
  { ssr: false }
);

export default async function CLTemplatePage() {
  const cvTemplates = await getCVTemplates();
  
  // Debug: Log raw template data from API
  console.log("[cvTemplates/page] Raw templates from API:", JSON.stringify(cvTemplates.map(t => ({ 
    _id: t._id, 
    _idType: typeof t._id,
    _idValue: t._id,
    title: t.title 
  })), null, 2));

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 sm:py-16">
      <main className="py-20">
      <div className="mx-auto px-4">
        <div className="flex gap-4">
          <div>
            <VerticalAdvertisementSection />
          </div>
          <div className="flex-1">
            <HeaderCVSection />
            <TemplateCVSection initialTemplates={cvTemplates} />
          </div>
          <div>
            <VerticalAdvertisementSection />
          </div>
        </div>
      </div>
    </main>
    </div>
  );
}
