import { HeroSection } from "@/components/sections/hero-section";
import { FeaturesSection } from "@/components/sections/features-section";
import CVSection from "@/components/sections/cv-template-in-home";
import { HowToBuildCVSection } from "@/components/sections/how-to-create-cv";
import { getCVTemplates } from "@/api/cvapi";
import AdvertisementSection from "@/components/sections/advertisement-section";
import PopupAd from "@/components/modals/popup-ad";

export default async function Home() {
  const cvTemplates = await getCVTemplates();
  return (
    <div>
      <PopupAd />
      <HeroSection />
      <CVSection initialTemplates={cvTemplates} />
      <AdvertisementSection position="top" />
      <HowToBuildCVSection />
      <FeaturesSection />
    </div>
  );
}
