"use client";

import { useLanguage } from "@/providers/global_provider";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams();
  const templateId = searchParams.get("id") || "";
  const { language } = useLanguage();
  const t = translations[language].chooseCreate;

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {t.title}
        </h2>
        <p className="mt-4 text-lg leading-8 text-gray-600">{t.subtitle}</p>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-x-6">
          {/* Nút Tạo thủ công */}
          <Link
            href={`/createCV?id=${templateId}`}
            className="flex min-h-[160px] flex-col items-center justify-center rounded-lg border border-gray-300 bg-white p-6 text-base font-semibold text-blue-600 shadow-sm transition-all hover:border-blue-500 hover:bg-blue-50 hover:scale-105"
          >
            <span className="text-xl">✍️</span>
            <span className="mt-2">{t.buttons.manual.label}</span>
            <span className="mt-1 text-sm font-normal text-gray-500">
              {t.buttons.manual.description}
            </span>
          </Link>

          {/* Nút Tạo với AI */}
          <Link
            href={`/createCV-AI?id=${templateId}`}
            className="flex flex-col items-center justify-center rounded-lg border border-gray-300 bg-white p-6 text-base font-semibold text-blue-600 shadow-sm transition-all hover:border-blue-500 hover:bg-blue-50 hover:scale-105"
          >
            <span className="text-xl">✨</span>
            <span className="mt-2">{t.buttons.ai.label}</span>
            <span className="mt-1 text-sm font-normal text-gray-500">
              {t.buttons.ai.description}
            </span>
          </Link>

          {/* Nút Tải lên & Chỉnh sửa */}
          <Link
            href={`/uploadCV?id=${templateId}`}
            className="flex flex-col items-center justify-center rounded-lg border border-gray-300 bg-white p-6 text-base font-semibold text-blue-600 shadow-sm transition-all hover:border-blue-500 hover:bg-blue-50 hover:scale-105"
          >
            <span className="text-xl">🤖</span>
            <span className="mt-2">{t.buttons.upload.label}</span>
            <span className="mt-1 text-sm font-normal text-gray-500">
              {t.buttons.upload.description}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

