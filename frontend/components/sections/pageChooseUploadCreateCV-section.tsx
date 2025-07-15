"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // <-- Bước 1: Import useRouter
import { useCV } from "@/providers/cv-provider";
import { uploadAndAnalyzeCV } from "@/api/cvapi";

export default function PageChooseUploadCreateCVSection() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("id");
  const router = useRouter();
  const { pdfFile, jobDescription, updateUserData } = useCV();
  const [isLoading, setIsLoading] = useState(false);

  // Helper: Convert Uint8Array to File
  function uint8ArrayToFile(uint8Array: Uint8Array, fileName = "cv.pdf", mimeType = "application/pdf") {
    const blob = new Blob([uint8Array], { type: mimeType });
    return new File([blob], fileName, { type: mimeType });
  }

  const handleMyTemplateCreate = async () => {
    if (!pdfFile) {
      alert("Vui lòng tải lên file PDF trước.");
      return;
    }

    // Kiểm tra kích thước file (giới hạn 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (pdfFile.length > maxSize) {
      alert("File PDF quá lớn. Vui lòng chọn file nhỏ hơn 10MB.");
      return;
    }

    setIsLoading(true);
    try {
      const file = uint8ArrayToFile(pdfFile);
      console.log('  size:', file.size); // nên ~191*1024
      const result = await uploadAndAnalyzeCV(file, jobDescription);
      const userData = result?.analysisResult?.userData;
      if (userData) {
        updateUserData(userData);
      }
      router.push(`/createCV-AIManual?id=${templateId}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('413')) {
        alert("File PDF quá lớn. Vui lòng chọn file nhỏ hơn 10MB hoặc nén file trước khi tải lên.");
      } else {
        alert("Có lỗi khi phân tích CV bằng AI. Vui lòng thử lại.");
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleTemplateCreate = () => {
    router.push(`/createCV-AI?id=${templateId}`);
  };

  return (
    <div className="bg-white pt-10 pb-10 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Bạn muốn dùng mẫu nào?
        </h2>
        <p className="mt-4 text-lg leading-8 text-gray-600">
          Hãy chọn một phương pháp để bắt đầu hành trình của bạn.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <button
            type="button"
            onClick={handleMyTemplateCreate}
            disabled={isLoading}
            className="rounded-md border border-gray-300 bg-white 
            w-3/4 h-40 px-8 py-10 text-base font-semibold text-blue-600
            shadow-sm 
            transition-all duration-300 ease-in-out
            hover:bg-blue-100 hover:scale-105 disabled:bg-gray-100 disabled:cursor-not-allowed
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {isLoading ? "Đang xử lý..." : "Dùng mẫu bạn đã chọn"}
          </button>
          <button
            type="button"
            onClick={handleTemplateCreate}
            className="rounded-md border border-gray-300 bg-white 
            w-3/4 h-40 px-8 py-10 text-base font-semibold text-blue-600
            shadow-sm 
            transition-all duration-300 ease-in-out
            hover:bg-blue-100 hover:scale-105 
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Dùng mẫu bạn đăng tải
          </button>
        </div>
      </div>
    </div>
  );
}
