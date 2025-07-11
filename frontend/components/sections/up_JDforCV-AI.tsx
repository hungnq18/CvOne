"use client";

import { useState, useEffect } from "react";
import { useCV } from "@/providers/cv-provider";

interface UpJdStepProps {
}

const UpJdStep: React.FC<UpJdStepProps> = () => {
  const { jobDescription, setJobDescription } = useCV();

  const maxLength = 5000;
  const currentLength = jobDescription.length;

  return (
    <div className="bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600">
              Thêm mô tả công việc, yêu cầu và trách nhiệm để giúp AI hiểu rõ hơn về vị trí bạn muốn tạo CV.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 uppercase tracking-wide">
              MÔ TẢ CÔNG VIỆC
            </label>
            <div className="relative">
              <textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Dán nội dung mô tả công việc, yêu cầu và trách nhiệm vào đây."
                maxLength={maxLength}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {currentLength} / {maxLength}
              </div>
            </div>
          </div>
        </div>
        {/* Nút phân tích và ô hiển thị kết quả */}
        <div className="flex flex-col items-start space-y-4 mt-8">
          <button
            type="button"
            className="max-w-200 bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg shadow transition-colors"
          >
            Phân tích Mô tả công việc bằng AI
          </button>
          <div className="w-full max-w-2xl min-h-[50px] border border-gray-200 rounded-lg bg-gray-50 p-4 text-gray-700">
            {/* Kết quả phân tích sẽ hiển thị ở đây */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpJdStep;
