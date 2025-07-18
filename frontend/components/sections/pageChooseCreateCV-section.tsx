"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/providers/global-provider"; // Giả định hook này tồn tại

// --- ĐỐI TƯỢNG TRANSLATIONS ---
// Để dễ dàng sao chép, đối tượng này được đặt trực tiếp ở đây.
// Trong dự án thực tế, bạn có thể tách ra một tệp riêng.
const translations = {
  en: {
    chooseCreate: {
      title: "How would you like to create your CV?",
      subtitle: "Choose a method to start your journey to impress employers.",
      buttons: {
        manual: { label: "Create Manually", description: "Fill in each section yourself." },
        ai: { label: "Create with AI Assistance", description: "AI suggests content for you." },
        upload: { label: "Edit Existing CV with AI", description: "Upload and let AI analyze." }
      }
    }
  },
  vi: {
    chooseCreate: {
      title: "Bạn muốn tạo CV như thế nào?",
      subtitle: "Chọn một phương pháp để bắt đầu hành trình chinh phục nhà tuyển dụng của bạn.",
      buttons: {
        manual: { label: "Tạo thủ công", description: "Tự tay điền từng mục." },
        ai: { label: "Tạo với sự trợ giúp của AI", description: "AI gợi ý nội dung cho bạn." },
        upload: { label: "Chỉnh sửa CV có sẵn bằng AI", description: "Tải lên và để AI phân tích." }
      }
    }
  }
};

export default function CreateMethodSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const t = translations[language].chooseCreate; // Lấy "từ điển" cho component này
  
  const templateId = searchParams.get("id") || "";

  // Các hàm điều hướng không thay đổi
  const handleManualCreate = () => router.push(`/createCV?id=${templateId}`);
  const handleAiCreate = () => router.push(`/createCV-AI?id=${templateId}`);
  const handleUploadAndEditWithAi = () => router.push(`/uploadCV?id=${templateId}`);

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-5xl  px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {t.title}
        </h2>
        <p className="mt-4 text-lg leading-8 text-gray-600">
          {t.subtitle}
        </p>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-x-6">
          {/* Nút Tạo thủ công */}
          <button type="button" onClick={handleManualCreate} className="flex min-h-[160px] flex-col items-center justify-center rounded-lg border border-gray-300 bg-white p-6 text-base font-semibold text-blue-600 shadow-sm transition-all hover:border-blue-500 hover:bg-blue-50 hover:scale-105">
            <span className="text-xl">✍️</span>
            <span className="mt-2">{t.buttons.manual.label}</span>
            <span className="mt-1 text-sm font-normal text-gray-500">{t.buttons.manual.description}</span>
          </button>

          {/* Nút Tạo với AI */}
          <button type="button" onClick={handleAiCreate} className="flex flex-col items-center justify-center rounded-lg border border-gray-300 bg-white p-6 text-base font-semibold text-blue-600 shadow-sm transition-all hover:border-blue-500 hover:bg-blue-50 hover:scale-105">
            <span className="text-xl">✨</span>
            <span className="mt-2">{t.buttons.ai.label}</span>
            <span className="mt-1 text-sm font-normal text-gray-500">{t.buttons.ai.description}</span>
          </button>
          
          {/* Nút Tải lên & Chỉnh sửa */}
          <button type="button" onClick={handleUploadAndEditWithAi} className="flex flex-col items-center justify-center rounded-lg border border-gray-300 bg-white p-6 text-base font-semibold text-blue-600 shadow-sm transition-all hover:border-blue-500 hover:bg-blue-50 hover:scale-105">
            <span className="text-xl">🤖</span>
            <span className="mt-2">{t.buttons.upload.label}</span>
            <span className="mt-1 text-sm font-normal text-gray-500">{t.buttons.upload.description}</span>
          </button>
        </div>
      </div>
    </div>
  );
}