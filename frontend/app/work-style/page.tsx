"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "@/providers/global-provider";

const workStylesTranslations = {
  en: {
    heading: "What's your working style?",
    subheading: "This helps us personalize the tone of your letter.",
    back: "Back",
    continue: "Continue",
    styles: {
      ARTISTIC:
        "You thrive in dynamic environments driven by innovation and creativity.",
      ENTERPRISING:
        "You're accustomed to leading teams with empowering and decisive task delegation.",
      INVESTIGATIVE:
        "You bring a resourceful approach with a knack for problem-solving.",
      ORGANIZED: "You bring structure and focus to streamline tasks.",
      PRACTICAL:
        "You go above and beyond to meet goals and ensure timely task completion.",
      SERVICE_ORIENTED:
        "You excel in collaborative situations and enjoy helping others.",
    },
  },
  vi: {
    heading: "Phong cách làm việc của bạn là gì?",
    subheading:
      "Chúng tôi sẽ cá nhân hóa giọng điệu của thư dựa trên điều này.",
    back: "Quay lại",
    continue: "Tiếp tục",
    styles: {
      ARTISTIC:
        "Bạn phát triển mạnh trong môi trường năng động, đổi mới và sáng tạo.",
      ENTERPRISING:
        "Bạn quen với việc dẫn dắt nhóm bằng cách phân chia nhiệm vụ quyết đoán.",
      INVESTIGATIVE:
        "Bạn có cách tiếp cận linh hoạt và giỏi giải quyết vấn đề.",
      ORGANIZED:
        "Bạn mang đến sự tổ chức và tập trung để tối ưu hóa công việc.",
      PRACTICAL: "Bạn luôn nỗ lực để hoàn thành mục tiêu đúng hạn.",
      SERVICE_ORIENTED: "Bạn làm việc nhóm tốt và thích giúp đỡ người khác.",
    },
  },
};

const workStyleTitles = [
  {
    key: "ARTISTIC",
    label: {
      en: "Artistic",
      vi: "Sáng tạo",
    },
  },
  {
    key: "ENTERPRISING",
    label: {
      en: "Enterprising",
      vi: "Dám nghĩ dám làm",
    },
  },
  {
    key: "INVESTIGATIVE",
    label: {
      en: "Investigative",
      vi: "Phân tích và điều tra",
    },
  },
  {
    key: "ORGANIZED",
    label: {
      en: "Organized",
      vi: "Tổ chức tốt",
    },
  },
  {
    key: "PRACTICAL",
    label: {
      en: "Practical",
      vi: "Thực tế",
    },
  },
  {
    key: "SERVICE_ORIENTED",
    label: {
      en: "Service-oriented",
      vi: "Hướng đến phục vụ",
    },
  },
];

export default function WorkStylePage() {
  const router = useRouter();
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const { language } = useLanguage();
  const t = workStylesTranslations[language];

  useEffect(() => {
    const savedDataString = localStorage.getItem("coverLetterData");
    if (savedDataString) {
      const coverLetterData = JSON.parse(savedDataString);
      if (coverLetterData.workStyle) {
        setSelectedStyle(coverLetterData.workStyle);
      }
    }
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    if (!selectedStyle) return;

    const savedDataString = localStorage.getItem("coverLetterData");
    const coverLetterData = savedDataString ? JSON.parse(savedDataString) : {};

    const updatedData = { ...coverLetterData, workStyle: selectedStyle };
    localStorage.setItem("coverLetterData", JSON.stringify(updatedData));

    router.push(`/uploadJD`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-4xl">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t.heading}</h1>
          <p className="text-gray-600 text-lg">{t.subheading}</p>
        </div>

        {/* Work Style Cards Grid */}
        <div className="grid grid-cols-3 gap-6 mb-16">
          {workStyleTitles.map((style) => (
            <div
              key={style.key}
              className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                selectedStyle === style.key
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 bg-white hover:border-gray-400"
              }`}
              onClick={() => setSelectedStyle(style.key)}
            >
              <div
                className={`-mx-6 -mt-6 mb-4 px-6 py-4 rounded-t-lg ${
                  selectedStyle === style.key ? "bg-blue-600" : "bg-gray-800"
                }`}
              >
                <h3 className="font-bold text-white text-center text-sm">
                  {style.label[language]}
                </h3>
              </div>

              <p className="text-center text-gray-700 text-sm leading-relaxed">
                {t.styles[style.key as keyof typeof t.styles]}
              </p>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-8 py-3 text-lg font-semibold text-gray-700 bg-white border border-gray-400 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
            {t.back}
          </button>

          <button
            onClick={handleContinue}
            disabled={!selectedStyle}
            className="flex items-center gap-2 px-8 py-3 text-lg font-semibold text-white bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t.continue}
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
