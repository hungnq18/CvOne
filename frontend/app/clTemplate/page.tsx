"use client";
import { CLTemplate, getCLTemplates } from "@/api/clApi";
import AdvertisementSection from "@/components/sections/advertisement-section";
import Header from "@/components/sections/header-pageclTemplate-section";
import TemplateSection from "@/components/sections/pageCLTemplate-section";
import { useLanguage } from "@/providers/global_provider";
import { useEffect, useState } from "react";

export default function Page() {
  const [clTemplates, setClTemplates] = useState<CLTemplate[]>([]);
  const { language } = useLanguage();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const templates = await getCLTemplates();
        setClTemplates(templates);
      } catch (error) {
        console.error("Failed to fetch CL templates:", error);
      }
    };

    fetchTemplates();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-20">
        <div className="container mx-auto px-4">
          <Header />
          <TemplateSection clTemplates={clTemplates} />

        </div>
      </main>
      <AdvertisementSection />
    </div>
  );
}