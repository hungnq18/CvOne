"use client";

import { useState, useEffect } from "react";
import { useCV } from "@/providers/cv-provider";
import { analyzeJD } from "@/api/cvapi";

interface UpJdStepProps {
}

const UpJdStep: React.FC<UpJdStepProps> = () => {
  const { jobDescription, setJobDescription, setJobAnalysis } = useCV();

  // State for AI analysis
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string>("");

  const maxLength = 5000;
  const currentLength = jobDescription.length;

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
      setJobAnalysis(result); // Lưu JSON gốc vào context
      const formattedResult = formatAnalysisResult(result);
      setAnalysisResult(formattedResult);
    } catch (error) {
      console.error("Error analyzing job description:", error);
      setAnalysisError("Có lỗi xảy ra khi phân tích. Vui lòng thử lại.");
    } finally {
      setIsAnalyzing(false);
    }
  };

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
            onClick={handleAnalyzeAI}
            disabled={isAnalyzing}
            className={`max-w-200 font-bold py-3 px-6 rounded-lg shadow transition-colors ${
              isAnalyzing
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-yellow-400 hover:bg-yellow-500 text-white"
            }`}
          >
            {isAnalyzing ? "Đang phân tích..." : "Phân tích Mô tả công việc bằng AI"}
          </button>
          
          {/* Error message */}
          {analysisError && (
            <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {analysisError}
            </div>
          )}
          
          {/* Analysis result */}
          {analysisResult && (
            <div className="w-full max-w-2xl min-h-[200px] border border-gray-200 rounded-lg bg-gray-50 p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Kết quả phân tích AI:</h3>
              <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                {analysisResult}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpJdStep;
