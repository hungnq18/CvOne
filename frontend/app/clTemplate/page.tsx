"use client";
import { CLTemplate, getCLTemplates } from "@/api/clApi";
import {
  AdvertisementSection,
  VerticalAdvertisementSection,
} from "@/components/sections/advertisement-section";
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 sm:py-16">
      <main className="py-20">
        <div className="mx-auto px-4">
          <div className="flex gap-4">
            {/* Banner dọc bên trái */}
            <div>
              <VerticalAdvertisementSection position="left" />
            </div>
            {/* Nội dung chính ở giữa */}
            <div className="flex-1">
              <Header />
              <TemplateSection clTemplates={clTemplates} />
            </div>
            {/* Banner dọc bên phải */}
            <div>
              <VerticalAdvertisementSection position="right" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}