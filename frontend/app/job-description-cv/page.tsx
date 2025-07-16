"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCV } from "@/providers/cv-provider";
import { analyzeJD, uploadAndAnalyzeCV } from "@/api/cvapi";

export default function JobDescriptionPage() {
  const router = useRouter();
  const { jobDescription, setJobDescription, pdfFile, updateUserData } = useCV();

  const searchParams = useSearchParams();
  const templateId = searchParams.get("id");

  // State for AI analysis
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string>("");
  const [isCreatingCV, setIsCreatingCV] = useState(false); // loading cho nút Tạo CV

  const handleBack = () => {
    router.back();
  };

  // Logic chuyển từ handleMyTemplateCreate
  const uint8ArrayToFile = (uint8Array: Uint8Array, fileName = "cv.pdf", mimeType = "application/pdf") => {
    const blob = new Blob([uint8Array], { type: mimeType });
    return new File([blob], fileName, { type: mimeType });
  };

  const handleContinue = async () => {
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

    setIsCreatingCV(true);
    try {
      const file = uint8ArrayToFile(pdfFile);
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
      setIsCreatingCV(false);
    }
  };

  const formatAnalysisResult = (result: any): string => {
    try {
      // Nếu result là string, trả về luôn
      if (typeof result === 'string') {
        return result;
      }

      // Nếu có analysis field, sử dụng nó
      if (result.analysis) {
        return result.analysis;
      }

      // Nếu có message field, sử dụng nó
      if (result.message) {
        return result.message;
      }

      // Xử lý JSON object và chuyển thành đoạn văn tiếng Việt
      let analysis = "📋 **KẾT QUẢ PHÂN TÍCH CÔNG VIỆC**\n\n";

      // Thông tin về cấp độ kinh nghiệm
      if (result.experienceLevel) {
        const levelMap: { [key: string]: string } = {
          'senior': 'Cấp cao (Senior)',
          'mid-level': 'Cấp trung (Mid-level)',
          'junior': 'Cấp cơ sở (Junior)',
          'entry-level': 'Cấp mới bắt đầu (Entry-level)'
        };
        const level = levelMap[result.experienceLevel] || result.experienceLevel;
        analysis += `🎯 **Cấp độ kinh nghiệm:** ${level}\n\n`;
      }

      // Kỹ năng yêu cầu
      if (result.requiredSkills && result.requiredSkills.length > 0) {
        analysis += `💼 **Kỹ năng yêu cầu:**\n`;
        result.requiredSkills.forEach((skill: string, index: number) => {
          analysis += `   ${index + 1}. ${skill}\n`;
        });
        analysis += '\n';
      }

      // Công nghệ sử dụng
      if (result.technologies && result.technologies.length > 0) {
        analysis += `🛠️ **Công nghệ sử dụng:**\n`;
        result.technologies.forEach((tech: string, index: number) => {
          analysis += `   ${index + 1}. ${tech}\n`;
        });
        analysis += '\n';
      }

      // Trách nhiệm chính
      if (result.keyResponsibilities && result.keyResponsibilities.length > 0) {
        analysis += `📝 **Trách nhiệm chính:**\n`;
        result.keyResponsibilities.forEach((resp: string, index: number) => {
          analysis += `   ${index + 1}. ${resp}\n`;
        });
        analysis += '\n';
      }

      // Kỹ năng mềm
      if (result.softSkills && result.softSkills.length > 0) {
        analysis += `🤝 **Kỹ năng mềm:**\n`;
        result.softSkills.forEach((skill: string, index: number) => {
          analysis += `   ${index + 1}. ${skill}\n`;
        });
        analysis += '\n';
      }

      // Ngành nghề
      if (result.industry) {
        analysis += `🏢 **Ngành nghề:** ${result.industry}\n\n`;
      }

      // Yêu cầu học vấn
      if (result.education) {
        analysis += `🎓 **Yêu cầu học vấn:** ${result.education}\n\n`;
      }

      // Chứng chỉ (nếu có)
      if (result.certifications && result.certifications.length > 0) {
        analysis += `🏆 **Chứng chỉ khuyến nghị:**\n`;
        result.certifications.forEach((cert: string, index: number) => {
          analysis += `   ${index + 1}. ${cert}\n`;
        });
        analysis += '\n';
      }

      // Thêm gợi ý tổng quan
      analysis += `💡 **GỢI Ý CHO CV:**\n`;
      analysis += `• Tập trung vào các kỹ năng và công nghệ được yêu cầu\n`;
      analysis += `• Nhấn mạnh kinh nghiệm phù hợp với cấp độ ${result.experienceLevel || 'công việc'}\n`;
      analysis += `• Đưa ra các ví dụ cụ thể về trách nhiệm đã thực hiện\n`;
      analysis += `• Thể hiện kỹ năng mềm thông qua các dự án nhóm\n`;

      return analysis;
    } catch (error) {
      console.error('Error formatting analysis result:', error);
      return JSON.stringify(result, null, 2);
    }
  };

  const handleAnalyzeAI = async () => {
    if (!jobDescription.trim()) {
      setAnalysisError("Vui lòng nhập mô tả công việc trước khi phân tích");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError("");
    setAnalysisResult("");

    try {
      const result = await analyzeJD(jobDescription);
      const formattedResult = formatAnalysisResult(result);
      setAnalysisResult(formattedResult);
    } catch (error) {
      console.error("Error analyzing job description:", error);
      setAnalysisError("Có lỗi xảy ra khi phân tích. Vui lòng thử lại.");
    } finally {
      setIsAnalyzing(false);
    }
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
              onClick={handleAnalyzeAI}
              disabled={isAnalyzing}
              className={`font-bold py-3 px-6 rounded-lg shadow transition-colors ${
                isAnalyzing
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-yellow-400 hover:bg-yellow-500 text-white"
              }`}
            >
              {isAnalyzing ? "Đang phân tích..." : "Phân tích bằng AI"}
            </button>
            
            {/* Error message */}
            {analysisError && (
              <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {analysisError}
              </div>
            )}
            
            {/* Analysis result */}
            {analysisResult && (
              <div className="w-full min-h-[200px] border border-gray-200 rounded-lg bg-gray-50 p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Kết quả phân tích AI:</h3>
                <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                  {analysisResult}
                </div>
              </div>
            )}
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
            disabled={isCreatingCV}
            className={`flex items-center gap-2 px-8 py-3 text-lg font-semibold text-white rounded-full transition-colors ${isCreatingCV ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'}`}
          >
            {isCreatingCV ? 'Đang xử lý...' : 'Tạo CV'}
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
