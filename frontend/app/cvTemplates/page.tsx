import { getCVTemplates } from "@/api/cvapi";
import HeaderCVSection from "@/components/sections/header-pagecvTemplate-section";
import NextDynamic from "next/dynamic";
import AdvertisementSection, {
  VerticalAdvertisementSection,
} from "@/components/sections/advertisement-section";

export const dynamic = "force-dynamic";
export const revalidate = 0; // Disable caching

const TemplateCVSection = NextDynamic(
  () => import("@/components/sections/pageCVTemplate-section"),
  { ssr: false },
);

export default async function CLTemplatePage() {
  const cvTemplates = await getCVTemplates();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 sm:py-16">
      <main className="py-20">
        <div className="mx-auto px-4">
          <div className="flex gap-4">
            <div>
              <VerticalAdvertisementSection position="left" />
            </div>
            <div className="flex-1 max-w-7xl mx-auto w-full">
              <HeaderCVSection />
              <TemplateCVSection initialTemplates={cvTemplates} />
            </div>
            <div>
              <VerticalAdvertisementSection position="right" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
