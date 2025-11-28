"use client";

import { uploadAndAnalyzeCV } from "@/api/cvapi";
import { useCV } from "@/providers/cv-provider";
import { useLanguage } from "@/providers/global_provider"; // Giả định hook này tồn tại
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { notify } from "@/lib/notify";

// --- ĐỐI TƯỢNG TRANSLATIONS ---
const translations = {
  en: {
    chooseUpload: {
      title: "Use your uploaded CV?",
      subtitle: "Choose how you want to proceed with the uploaded CV file.",
      buttons: {
        analyze: {
          label: "Analyze CV and fill in the new template",
          description:
            "AI will read your CV and automatically fill in the information.",
          loading: "Analyzing...",
        },
        startOver: {
          label: "Start over with AI assistance",
          description: "Skip the uploaded file and create a new CV with AI.",
        },
      },
      alerts: {
        noFile: "Please upload your CV file first.",
        fileTooLargeInitial:
          "File size exceeds 10MB. Please choose a smaller file.",
        fileTooLarge413:
          "The PDF file is too large. Please select a file smaller than 10MB or compress it before uploading.",
        analysisError:
          "An error occurred while analyzing the CV. Please try again.",
      },
    },
  },
  vi: {
    chooseUpload: {
      title: "Sử dụng CV bạn vừa tải lên?",
      subtitle: "Chọn cách bạn muốn tiếp tục với file CV đã được tải lên.",
      buttons: {
        analyze: {
          label: "Phân tích CV và điền vào mẫu mới",
          description: "AI sẽ đọc CV của bạn và tự động điền thông tin.",
          loading: "Đang phân tích...",
        },
        startOver: {
          label: "Bắt đầu lại với sự trợ giúp của AI",
          description: "Bỏ qua file đã tải và tạo CV mới với AI.",
        },
      },
      alerts: {
        noFile: "Vui lòng tải lên file CV của bạn trước.",
        fileTooLargeInitial:
          "Kích thước file vượt quá 10MB. Vui lòng chọn file nhỏ hơn.",
        fileTooLarge413:
          "File PDF quá lớn. Vui lòng chọn file nhỏ hơn 10MB hoặc nén file trước khi tải lên.",
        analysisError: "Đã xảy ra lỗi khi phân tích CV. Vui lòng thử lại.",
      },
    },
  },
};

export default function PageChooseUploadCreateCVSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { pdfFile, jobDescription, updateUserData } = useCV();
  const { language } = useLanguage();
  const t = translations[language].chooseUpload; // Lấy "từ điển" cho component này

  const [isLoading, setIsLoading] = useState(false);
  const templateId = searchParams.get("id") || "";

  const uint8ArrayToFile = (
    uint8Array: Uint8Array,
    fileName = "cv.pdf",
    mimeType = "application/pdf"
  ): File => {
    const blob = new Blob([uint8Array as BlobPart], { type: mimeType });
    return new File([blob], fileName, { type: mimeType });
  };

  const handleAnalyzeUploadedCV = async () => {
    if (!pdfFile) {
      notify.error(t.alerts.noFile);
      return;
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (pdfFile.length > MAX_FILE_SIZE) {
      notify.error(t.alerts.fileTooLargeInitial);
      return;
    }

    setIsLoading(true);
    try {
      const fileToUpload = uint8ArrayToFile(pdfFile);
      const result = await uploadAndAnalyzeCV(fileToUpload, jobDescription);

      if (result?.analysisResult?.userData) {
        updateUserData(result.analysisResult.userData);
        // Đợi một chút để đảm bảo context được update
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      router.replace(`/createCV-AIManual?id=${templateId}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes("413")) {
        notify.error(t.alerts.fileTooLarge413);
      } else {
        notify.error(t.alerts.analysisError);
        console.error("Lỗi phân tích CV:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWithAIAssistanceInstead = () => {
    router.push(`/createCV-AI?id=${templateId}`);
  };

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {t.title}
        </h2>
        <p className="mt-4 text-lg leading-8 text-gray-600">{t.subtitle}</p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
          {/* Nút Phân tích CV */}
          <button
            type="button"
            onClick={handleAnalyzeUploadedCV}
            disabled={isLoading || !pdfFile}
            className="w-full sm:w-1/2 flex flex-col items-center justify-center rounded-lg border border-gray-300 bg-white p-6 text-base font-semibold text-blue-600 shadow-sm transition-all hover:border-blue-500 hover:bg-blue-50 hover:scale-105 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:opacity-70"
          >
            {isLoading ? t.buttons.analyze.loading : t.buttons.analyze.label}
            <span className="mt-1 text-sm font-normal text-gray-500">
              {t.buttons.analyze.description}
            </span>
          </button>

          {/* Nút Bắt đầu lại */}
          <button
            type="button"
            onClick={handleCreateWithAIAssistanceInstead}
            className="w-full sm:w-1/2 flex flex-col items-center justify-center rounded-lg border border-gray-300 bg-white p-6 text-base font-semibold text-gray-800 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 hover:scale-105"
          >
            {t.buttons.startOver.label}
            <span className="mt-1 text-sm font-normal text-gray-500">
              {t.buttons.startOver.description}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
