"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, FC, ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCV } from "@/providers/cv-provider";
import { analyzeJD, uploadAndAnalyzeCV } from "@/api/cvapi";
import { useLanguage } from "@/providers/global-provider";

// --- ĐỐI TƯỢNG TRANSLATIONS (KHÔNG ĐỔI) ---
const translations = {
  en: {
    jobDescriptionPage: {
      ui: {
        title: "Add Job Description",
        label: "JOB DESCRIPTION",
        placeholder: "Enter the job description required by the employer here. You can leave it blank if you don't have a specific job yet.",
        buttonAnalyzing: "Analyzing...",
        buttonAnalyze: "Analyze with AI",
        analysisResultTitle: "AI Analysis Result:",
        buttonBack: "Back",
        buttonCreating: "Processing...",
        buttonCreateCV: "Create CV",
      },
      alerts: {
        pdfMissing: "Please upload a PDF file first.",
        pdfTooLarge: "The PDF file is too large. Please select a file smaller than 10MB.",
        pdfTooLarge413: "The PDF file is too large. Please select a file smaller than 10MB or compress it before uploading.",
        cvAnalysisError: "An error occurred while analyzing the CV with AI. Please try again.",
        jdMissing: "Please enter the job description before analyzing.",
        jdAnalysisError: "An error occurred during analysis. Please try again.",
      },
      analysisResults: {
        title: "📋 Job Analysis Result",
        levelMap: {
          'senior': 'Senior',
          'mid-level': 'Mid-level',
          'junior': 'Junior',
          'entry-level': 'Entry-level'
        },
        experienceLevel: "Experience Level",
        requiredSkills: "Required Skills",
        technologies: "Technologies Used",
        keyResponsibilities: "Key Responsibilities",
        softSkills: "Soft Skills",
        industry: "Industry",
        education: "Education Requirement",
        certifications: "Recommended Certifications",
        suggestionsTitle: "CV Suggestions",
        suggestionFocusSkills: "Focus on the required skills and technologies",
        suggestionFocusExperience: (level: string) => `Emphasize experience relevant to the ${level} level`,
        suggestionResponsibilities: "Provide specific examples of responsibilities performed",
        suggestionSoftSkills: "Demonstrate soft skills through team projects",
        defaultLevel: "job's",
        errorFormatting: 'Error formatting analysis result:',
      },
    }
  },
  vi: {
    jobDescriptionPage: {
      ui: {
        title: "Thêm mô tả công việc",
        label: "MÔ TẢ CÔNG VIỆC",
        placeholder: "Viết mô tả công việc mà nhà tuyển dụng yêu cầu vào đây. Bạn có thể để trống nếu chưa có công việc cụ thể.",
        buttonAnalyzing: "Đang phân tích...",
        buttonAnalyze: "Phân tích bằng AI",
        analysisResultTitle: "Kết quả phân tích AI", // Sửa lại tiêu đề này
        buttonBack: "Quay Lại",
        buttonCreating: "Đang xử lý...",
        buttonCreateCV: "Tạo CV",
      },
      alerts: {
        pdfMissing: "Vui lòng tải lên file PDF trước.",
        pdfTooLarge: "File PDF quá lớn. Vui lòng chọn file nhỏ hơn 10MB.",
        pdfTooLarge413: "File PDF quá lớn. Vui lòng chọn file nhỏ hơn 10MB hoặc nén file trước khi tải lên.",
        cvAnalysisError: "Có lỗi khi phân tích CV bằng AI. Vui lòng thử lại.",
        jdMissing: "Vui lòng nhập mô tả công việc trước khi phân tích.",
        jdAnalysisError: "Có lỗi xảy ra khi phân tích. Vui lòng thử lại.",
      },
      analysisResults: {
        title: "📋 Kết Quả Phân Tích Công Việc",
        levelMap: {
          'senior': 'Cấp cao (Senior)',
          'mid-level': 'Cấp trung (Mid-level)',
          'junior': 'Cấp cơ sở (Junior)',
          'entry-level': 'Cấp mới bắt đầu (Entry-level)'
        },
        experienceLevel: "Cấp độ kinh nghiệm",
        requiredSkills: "Kỹ năng yêu cầu",
        technologies: "Công nghệ sử dụng",
        keyResponsibilities: "Trách nhiệm chính",
        softSkills: "Kỹ năng mềm",
        industry: "Ngành nghề",
        education: "Yêu cầu học vấn",
        certifications: "Chứng chỉ khuyến nghị",
        suggestionsTitle: "💡 Gợi Ý Cho CV",
        suggestionFocusSkills: "Tập trung vào các kỹ năng và công nghệ được yêu cầu",
        suggestionFocusExperience: (level: string) => `Nhấn mạnh kinh nghiệm phù hợp với cấp độ ${level}`,
        suggestionResponsibilities: "Đưa ra các ví dụ cụ thể về trách nhiệm đã thực hiện",
        suggestionSoftSkills: "Thể hiện kỹ năng mềm thông qua các dự án nhóm",
        defaultLevel: "công việc",
        errorFormatting: 'Lỗi khi định dạng kết quả phân tích:',
      },
    }
  }
};

// --- CÁC COMPONENT CON ĐỂ HIỂN THỊ KẾT QUẢ ĐẸP HƠN ---
const AnalysisSection: FC<{ icon: string; title: string; children: ReactNode; }> = ({ icon, title, children }) => (
  <div className="mb-5">
    <h4 className="text-md font-semibold text-gray-800 mb-2 flex items-center">
      <span className="text-xl mr-2">{icon}</span>
      {title}
    </h4>
    <div className="pl-8 text-sm text-gray-700">{children}</div>
  </div>
);

const AnalysisList: FC<{ items: string[] }> = ({ items }) => (
  <ul className="list-disc list-inside space-y-1">
    {items.map((item, index) => <li key={index}>{item}</li>)}
  </ul>
);

// --- HÀM formatAnalysisResult ĐÃ ĐƯỢC NÂNG CẤP ĐỂ TRẢ VỀ JSX ---
const formatAnalysisResult = (result: any, t_results: typeof translations.vi.jobDescriptionPage.analysisResults): ReactNode => {
  try {
    if (typeof result === 'string' || result.analysis || result.message) {
      return <div className="whitespace-pre-wrap">{result.analysis || result.message || result}</div>;
    }

    const level = result.experienceLevel ? t_results.levelMap[result.experienceLevel as keyof typeof t_results.levelMap] || result.experienceLevel : null;
    const suggestions = [
      t_results.suggestionFocusSkills,
      t_results.suggestionFocusExperience(result.experienceLevel || t_results.defaultLevel),
      t_results.suggestionResponsibilities,
      t_results.suggestionSoftSkills,
    ];

    return (
      <div className="space-y-4">
        {level && <AnalysisSection icon="🎯" title={t_results.experienceLevel}>{level}</AnalysisSection>}
        {result.requiredSkills?.length > 0 && <AnalysisSection icon="💼" title={t_results.requiredSkills}><AnalysisList items={result.requiredSkills} /></AnalysisSection>}
        {result.technologies?.length > 0 && <AnalysisSection icon="🛠️" title={t_results.technologies}><AnalysisList items={result.technologies} /></AnalysisSection>}
        {result.keyResponsibilities?.length > 0 && <AnalysisSection icon="📝" title={t_results.keyResponsibilities}><AnalysisList items={result.keyResponsibilities} /></AnalysisSection>}
        {result.softSkills?.length > 0 && <AnalysisSection icon="🤝" title={t_results.softSkills}><AnalysisList items={result.softSkills} /></AnalysisSection>}
        {result.industry && <AnalysisSection icon="🏢" title={t_results.industry}>{result.industry}</AnalysisSection>}
        {result.education && <AnalysisSection icon="🎓" title={t_results.education}>{result.education}</AnalysisSection>}
        {result.certifications?.length > 0 && <AnalysisSection icon="🏆" title={t_results.certifications}><AnalysisList items={result.certifications} /></AnalysisSection>}
        <AnalysisSection icon="💡" title={t_results.suggestionsTitle}><AnalysisList items={suggestions} /></AnalysisSection>
      </div>
    );
  } catch (error) {
    console.error(t_results.errorFormatting, error);
    return <div className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</div>;
  }
};

export default function JobDescriptionPage() {
  const { language } = useLanguage();
  const t = translations[language].jobDescriptionPage;

  const router = useRouter();
  const { jobDescription, setJobDescription, pdfFile, updateUserData } = useCV();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("id");

  const [analysisResult, setAnalysisResult] = useState<ReactNode | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string>("");
  const [isCreatingCV, setIsCreatingCV] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const uint8ArrayToFile = (uint8Array: Uint8Array, fileName = "cv.pdf", mimeType = "application/pdf") => {
    const blob = new Blob([uint8Array], { type: mimeType });
    return new File([blob], fileName, { type: mimeType });
  };

  const handleContinue = async () => {
    if (!pdfFile) {
      alert(t.alerts.pdfMissing);
      return;
    }
    const maxSize = 10 * 1024 * 1024;
    if (pdfFile.length > maxSize) {
      alert(t.alerts.pdfTooLarge);
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
        alert(t.alerts.pdfTooLarge413);
      } else {
        alert(t.alerts.cvAnalysisError);
      }
      console.error(error);
    } finally {
      setIsCreatingCV(false);
    }
  };

  const handleAnalyzeAI = async () => {
    if (!jobDescription.trim()) {
      setAnalysisError(t.alerts.jdMissing);
      return;
    }
    setIsAnalyzing(true);
    setAnalysisError("");
    setAnalysisResult(null);
    try {
      const result = await analyzeJD(jobDescription);
      const formattedResult = formatAnalysisResult(result, t.analysisResults);
      setAnalysisResult(formattedResult);
    } catch (error) {
      console.error("Error analyzing job description:", error);
      setAnalysisError(t.alerts.jdAnalysisError);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const maxLength = 5000;
  const currentLength = jobDescription.length;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{t.ui.title}</h1>
          </div>
          <div className="space-y-2">
            <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 uppercase tracking-wide">{t.ui.label}</label>
            <div className="relative">
              <textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder={t.ui.placeholder}
                maxLength={maxLength}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">{currentLength} / {maxLength}</div>
            </div>
          </div>
          <div className="flex flex-col items-start space-y-4 mt-4">
            <button type="button" onClick={handleAnalyzeAI} disabled={isAnalyzing} className={`font-bold py-3 px-6 rounded-lg shadow transition-colors ${ isAnalyzing ? "bg-gray-400 text-white cursor-not-allowed" : "bg-yellow-400 hover:bg-yellow-500 text-white"}`}>
              {isAnalyzing ? t.ui.buttonAnalyzing : t.ui.buttonAnalyze}
            </button>
            {analysisError && <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{analysisError}</div>}
            {analysisResult && (
              <div className="w-full border border-gray-200 rounded-lg bg-gray-50 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">{t.analysisResults.title}</h3>
                {analysisResult}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center pt-8">
          <button onClick={handleBack} className="flex items-center gap-2 px-8 py-3 text-lg font-semibold text-gray-700 bg-white border border-gray-400 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} />
            {t.ui.buttonBack}
          </button>
          <button onClick={handleContinue} disabled={isCreatingCV} className={`flex items-center gap-2 px-8 py-3 text-lg font-semibold text-white rounded-full transition-colors ${isCreatingCV ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'}`}>
            {isCreatingCV ? t.ui.buttonCreating : t.ui.buttonCreateCV}
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}