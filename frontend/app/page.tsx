import { HeroSection } from "@/components/sections/hero-section"
import { FeaturesSection } from "@/components/sections/features-section"
import CVSection from "@/components/sections/cv-template-in-home"
import { HowToBuildCVSection } from "@/components/sections/how-to-create-cv"


export default function Home() {
  return (
    <div>
      <HeroSection />
      <CVSection />
      <HowToBuildCVSection />
      <FeaturesSection />
    </div>
  )
}
