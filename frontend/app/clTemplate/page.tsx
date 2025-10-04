"use client";
import React, { useState, useEffect } from "react";
import Header from "@/components/sections/header-pageclTemplate-section";
import TemplateSection from "@/components/sections/pageCLTemplate-section";
import { getCLTemplates, CLTemplate } from "@/api/clApi";
import { useLanguage } from "@/providers/global-provider";
import AdvertisementSection from "@/components/sections/advertisement-section";

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