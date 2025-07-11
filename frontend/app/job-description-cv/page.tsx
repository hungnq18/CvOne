"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function JobDescriptionPage() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState<string>("");

  const searchParams = useSearchParams();
  const templateId = searchParams.get("id");

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    if (jobDescription.length !== 0) {
      localStorage.setItem("jobDescriptionCV", jobDescription);
    }
    router.push(`/chooseUploadCreateCV?id=${templateId}`);
  };

  const maxLength = 5000;
  const currentLength = jobDescription.length;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Main Content */}
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Thêm mô tả công việc
            </h1>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="jobDescription"
              className="block text-sm font-medium text-gray-700 uppercase tracking-wide"
            >
              MÔ TẢ CÔNG VIỆC
            </label>
            <div className="relative">
              <textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Viết mô tả công việc mà nhà tuyển dụng yêu cầu vào đây. Bạn có thể để trống nếu chưa có công việc cụ thể."
                maxLength={maxLength}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {currentLength} / {maxLength}
              </div>
            </div>
          </div>

          {/* Nút phân tích bằng AI và ô output */}
          <div className="flex flex-col items-start space-y-4 mt-4">
            <button
              type="button"
              className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg shadow transition-colors"
            >
              Phân tích bằng AI
            </button>
            <div className="w-full min-h-[0] border border-gray-200 rounded-lg bg-gray-50 p-1 text-gray-700">
              {/* Kết quả AI sẽ hiển thị ở đây */}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-8 py-3 text-lg font-semibold text-gray-700 bg-white border border-gray-400 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
            Quay Lại
          </button>

          <button
            onClick={handleContinue}
            className="flex items-center gap-2 px-8 py-3 text-lg font-semibold text-white bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors"
          >
            Tạo CV
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
