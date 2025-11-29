"use client";

import {
  analyzeJD,
  uploadAndAnalyzeCV,
  uploadJDPdfAndAnalyze,
} from "@/api/cvapi";
import { useCV } from "@/providers/cv-provider";
import { useLanguage } from "@/providers/global_provider";
import { ArrowLeft, ArrowRight, Wand2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FC, ReactNode, useState } from "react";
import { notify } from "@/lib/notify";

// --- ĐỐI TƯỢNG TRANSLATIONS (KHÔNG ĐỔI) ---
const translations = {
  en: {
    jobDescriptionPage: {
      ui: {
        title: "Add Job Description",
        label: "JOB DESCRIPTION",
        placeholder:
          "Enter the job description required by the employer here. You can leave it blank if you don't have a specific job yet.",
        buttonAnalyzing: "Analyzing...",
        buttonAnalyze: "Analyze with AI",
        analysisResultTitle: "AI Analysis Result:",
        buttonBack: "Back",
        buttonCreating: "Processing...",
        buttonCreateCV: "Create CV",
        tabText: "JD Text",
        tabFile: "JD File PDF",
        fileUploadLabel: "UPLOAD JOB DESCRIPTION FILE",
        fileUploadPlaceholder: "Select a file",
        fileSelected: (name: string) => `Selected: ${name}`,
      },
      alerts: {
        pdfMissing: "Please upload a PDF file first.",
        pdfTooLarge:
          "The PDF file is too large. Please select a file smaller than 10MB.",
        pdfTooLarge413:
          "The PDF file is too large. Please select a file smaller than 10MB or compress it before uploading.",
        cvAnalysisError:
          "An error occurred while analyzing the CV with AI. Please try again.",
        jdMissing: "Please enter the job description before analyzing.",
        jdAnalysisError: "An error occurred during analysis. Please try again.",
        fileMissing: "Please select a file before analyzing.",
      },
      analysisResults: {
        title: "📋 Job Analysis Result",
        levelMap: {
          senior: "Senior",
          "mid-level": "Mid-level",
          junior: "Junior",
          "entry-level": "Entry-level",
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
        suggestionFocusExperience: (level: string) =>
          `Emphasize experience relevant to the ${level} level`,
        suggestionResponsibilities:
          "Provide specific examples of responsibilities performed",
        suggestionSoftSkills: "Demonstrate soft skills through team projects",
        defaultLevel: "job's",
        errorFormatting: "Error formatting analysis result:",
      },
    },
  },
  vi: {
    jobDescriptionPage: {
      ui: {
        title: "Thêm mô tả công việc",
        label: "MÔ TẢ CÔNG VIỆC",
        placeholder:
          "Viết mô tả công việc mà nhà tuyển dụng yêu cầu vào đây. Bạn có thể để trống nếu chưa có công việc cụ thể.",
        buttonAnalyzing: "Đang phân tích...",
        buttonAnalyze: "Phân tích bằng AI",
        analysisResultTitle: "Kết quả phân tích AI", // Sửa lại tiêu đề này
        buttonBack: "Quay Lại",
        buttonCreating: "Đang xử lý...",
        buttonCreateCV: "Tạo CV",
        tabText: "Mô tả văn bản",
        tabFile: "Tệp PDF",
        fileUploadLabel: "TẢI LÊN TỆP MÔ TẢ CÔNG VIỆC",
        fileUploadPlaceholder: "Chọn tệp",
        fileSelected: (name: string) => `Đã chọn: ${name}`,
      },
      alerts: {
        pdfMissing: "Vui lòng tải lên file PDF trước.",
        pdfTooLarge: "File PDF quá lớn. Vui lòng chọn file nhỏ hơn 10MB.",
        pdfTooLarge413:
          "File PDF quá lớn. Vui lòng chọn file nhỏ hơn 10MB hoặc nén file trước khi tải lên.",
        cvAnalysisError: "Có lỗi khi phân tích CV bằng AI. Vui lòng thử lại.",
        jdMissing: "Vui lòng nhập mô tả công việc trước khi phân tích.",
        jdAnalysisError: "Có lỗi xảy ra khi phân tích. Vui lòng thử lại.",
        fileMissing: "Vui lòng chọn một tệp trước khi phân tích.",
      },
      analysisResults: {
        title: "📋 Kết Quả Phân Tích Công Việc",
        levelMap: {
          senior: "Cấp cao (Senior)",
          "mid-level": "Cấp trung (Mid-level)",
          junior: "Cấp cơ sở (Junior)",
          "entry-level": "Cấp mới bắt đầu (Entry-level)",
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
        suggestionFocusSkills:
          "Tập trung vào các kỹ năng và công nghệ được yêu cầu",
        suggestionFocusExperience: (level: string) =>
          `Nhấn mạnh kinh nghiệm phù hợp với cấp độ ${level}`,
        suggestionResponsibilities:
          "Đưa ra các ví dụ cụ thể về trách nhiệm đã thực hiện",
        suggestionSoftSkills: "Thể hiện kỹ năng mềm thông qua các dự án nhóm",
        defaultLevel: "công việc",
        errorFormatting: "Lỗi khi định dạng kết quả phân tích:",
      },
    },
  },
};

// --- CÁC COMPONENT CON ĐỂ HIỂN THỊ KẾT QUẢ ĐẸP HƠN ---
const AnalysisSection: FC<{
  icon: string;
  title: string;
  children: ReactNode;
}> = ({ icon, title, children }) => (
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
    {items.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
);

// --- HÀM formatAnalysisResult ĐÃ ĐƯỢC NÂNG CẤP ĐỂ TRẢ VỀ JSX ---
// Hàm chuyển object phân tích thành text mô tả JD
function analysisToText(analysis: any): string {
  if (!analysis || typeof analysis !== "object") return "";
  let lines: string[] = [];
  if (analysis.experienceLevel)
    lines.push(`Kinh nghiệm: ${analysis.experienceLevel}`);
  if (analysis.requiredSkills?.length)
    lines.push(`Kỹ năng: ${analysis.requiredSkills.join(", ")}`);
  if (analysis.technologies?.length)
    lines.push(`Công nghệ: ${analysis.technologies.join(", ")}`);
  if (analysis.keyResponsibilities?.length)
    lines.push(`Trách nhiệm: ${analysis.keyResponsibilities.join(", ")}`);
  if (analysis.industry) lines.push(`Ngành: ${analysis.industry}`);
  if (analysis.education) lines.push(`Học vấn: ${analysis.education}`);
  if (analysis.certifications?.length)
    lines.push(`Chứng chỉ: ${analysis.certifications.join(", ")}`);
  if (analysis.softSkills?.length)
    lines.push(`Kỹ năng mềm: ${analysis.softSkills.join(", ")}`);
  return lines.join("\n");
}

const formatAnalysisResult = (
  result: any,
  t_results: typeof translations.vi.jobDescriptionPage.analysisResults
): ReactNode => {
  try {
    if (typeof result === "string" || result.analysis || result.message) {
      return (
        <div className="whitespace-pre-wrap">
          {result.analysis || result.message || result}
        </div>
      );
    }

    const level = result.experienceLevel
      ? t_results.levelMap[
          result.experienceLevel as keyof typeof t_results.levelMap
        ] || result.experienceLevel
      : null;
    const suggestions = [
      t_results.suggestionFocusSkills,
      t_results.suggestionFocusExperience(
        result.experienceLevel || t_results.defaultLevel
      ),
      t_results.suggestionResponsibilities,
      t_results.suggestionSoftSkills,
    ];

    return (
      <div className="space-y-4">
        {level && (
          <AnalysisSection icon="🎯" title={t_results.experienceLevel}>
            {level}
          </AnalysisSection>
        )}
        {result.requiredSkills?.length > 0 && (
          <AnalysisSection icon="💼" title={t_results.requiredSkills}>
            <AnalysisList items={result.requiredSkills} />
          </AnalysisSection>
        )}
        {result.technologies?.length > 0 && (
          <AnalysisSection icon="🛠️" title={t_results.technologies}>
            <AnalysisList items={result.technologies} />
          </AnalysisSection>
        )}
        {result.keyResponsibilities?.length > 0 && (
          <AnalysisSection icon="📝" title={t_results.keyResponsibilities}>
            <AnalysisList items={result.keyResponsibilities} />
          </AnalysisSection>
        )}
        {result.softSkills?.length > 0 && (
          <AnalysisSection icon="🤝" title={t_results.softSkills}>
            <AnalysisList items={result.softSkills} />
          </AnalysisSection>
        )}
        {result.industry && (
          <AnalysisSection icon="🏢" title={t_results.industry}>
            {result.industry}
          </AnalysisSection>
        )}
        {result.education && (
          <AnalysisSection icon="🎓" title={t_results.education}>
            {result.education}
          </AnalysisSection>
        )}
        {result.certifications?.length > 0 && (
          <AnalysisSection icon="🏆" title={t_results.certifications}>
            <AnalysisList items={result.certifications} />
          </AnalysisSection>
        )}
        <AnalysisSection icon="💡" title={t_results.suggestionsTitle}>
          <AnalysisList items={suggestions} />
        </AnalysisSection>
      </div>
    );
  } catch (error) {
    console.error(t_results.errorFormatting, error);
    return (
      <div className="whitespace-pre-wrap">
        {JSON.stringify(result, null, 2)}
      </div>
    );
  }
};

export default function JobDescriptionPage() {
  const { language } = useLanguage();
  const t = translations[language].jobDescriptionPage;

  const router = useRouter();
  const { jobDescription, setJobDescription, pdfFile, updateUserData } =
    useCV();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("id");

  const [activeTab, setActiveTab] = useState<"text" | "file">("text");
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ReactNode | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string>("");
  const [isCreatingCV, setIsCreatingCV] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const uint8ArrayToFile = (
    uint8Array: Uint8Array,
    fileName = "cv.pdf",
    mimeType = "application/pdf"
  ) => {
    const blob = new Blob([uint8Array.buffer as ArrayBuffer], {
      type: mimeType,
    });
    return new File([blob], fileName, { type: mimeType });
  };

  const handleContinue = async () => {
    if (!pdfFile) {
      notify.error(t.alerts.pdfMissing);
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (pdfFile.length > maxSize) {
      notify.error(t.alerts.pdfTooLarge);
      return;
    }

    setIsCreatingCV(true);

    try {
      let finalJobDescription = jobDescription;
      if (activeTab === "file") {
        if (!jdFile) {
          notify.error(t.alerts.jdMissing);
          setIsCreatingCV(false);
          return;
        }
        const result = await uploadJDPdfAndAnalyze(jdFile);

        let extractedText = result?.text?.trim() || "";
        if (!extractedText && result && typeof result === "object") {
          extractedText = analysisToText(result);
        }

        if (extractedText) {
          setJobDescription(extractedText);
          finalJobDescription = extractedText;
        } else {
          notify.error(t.alerts.jdMissing);
          setIsCreatingCV(false);
          return;
        }
      }
      if (!finalJobDescription || !finalJobDescription.trim()) {
        notify.error(t.alerts.jdMissing);
        setIsCreatingCV(false);
        return;
      }

      const file = uint8ArrayToFile(pdfFile);
      const result = await uploadAndAnalyzeCV(file, finalJobDescription);

      const userData = result?.analysisResult?.userData;
      if (userData) {
        updateUserData(userData);
        // Đợi một chút để đảm bảo context được update
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      router.replace(`/createCV-AIManual?id=${templateId}`);
    } catch (error) {
      console.error("Lỗi trong quá trình xử lý CV:", error);

      if (error instanceof Error) {
        if (error.message.includes("413")) {
          notify.error(t.alerts.pdfTooLarge413);
        } else if (error.message.includes("400")) {
          notify.error(
            "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại file CV và mô tả công việc."
          );
        } else if (error.message.includes("401")) {
          notify.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        } else if (error.message.includes("500")) {
          notify.error("Lỗi máy chủ. Vui lòng thử lại sau.");
        } else if (error.message.includes("Network")) {
          notify.error("Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.");
        } else {
          notify.error(t.alerts.cvAnalysisError);
        }
      } else {
        notify.error(t.alerts.cvAnalysisError);
      }
    } finally {
      // Luôn tắt trạng thái loading ở cuối
      setIsCreatingCV(false);
    }
  };

  const handleAnalyzeText = async () => {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setJdFile(e.target.files[0]);
    }
  };

  const handleAnalyzeFile = async () => {
    if (!jdFile) {
      setAnalysisError(t.alerts.fileMissing);
      return;
    }
    setIsAnalyzing(true);
    setAnalysisError("");
    setAnalysisResult(null);
    try {
      const result = await uploadJDPdfAndAnalyze(jdFile);
      const analysisData = result?.analysis || result;
      const extractedText = result?.text || "";

      if (extractedText) {
        setJobDescription(extractedText);
      }

      const formattedResult = formatAnalysisResult(
        analysisData,
        t.analysisResults
      );
      setAnalysisResult(formattedResult);
    } catch (error) {
      console.error("Error analyzing job description file:", error);
      setAnalysisError(t.alerts.jdAnalysisError);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const maxLength = 5000;
  const currentLength = jobDescription.length;

  const handleAnalyze = () => {
    if (activeTab === "text") {
      handleAnalyzeText();
    } else {
      handleAnalyzeFile();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center py-12 px-4 mt-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t.ui.title}
          </h1>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Panel: Input */}
          <div className="w-full md:w-1/2 space-y-6">
            <div className="flex border-b">
              <button
                onClick={() => {
                  setJobDescription("");
                  setActiveTab("text");
                }}
                className={`py-2 px-4 text-sm font-medium transition-colors ${
                  activeTab === "text"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.ui.tabText}
              </button>
              <button
                onClick={() => setActiveTab("file")}
                className={`py-2 px-4 text-sm font-medium transition-colors ${
                  activeTab === "file"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.ui.tabFile}
              </button>
            </div>

            {activeTab === "text" ? (
              <div className="space-y-2">
                <label
                  htmlFor="jobDescription"
                  className="block text-sm font-medium text-gray-700 uppercase tracking-wide"
                >
                  {t.ui.label}
                </label>
                <div className="relative">
                  <textarea
                    id="jobDescription"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder={t.ui.placeholder}
                    maxLength={maxLength}
                    rows={10}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                    {currentLength} / {maxLength}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">
                  {t.ui.fileUploadLabel}
                </label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="dropzone-file"
                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-4 text-gray-500"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">
                          {t.ui.fileUploadPlaceholder}
                        </span>
                      </p>
                      {jdFile && (
                        <p className="text-base font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg shadow-sm mt-2">
                          {t.ui.fileSelected(jdFile.name)}
                        </p>
                      )}
                    </div>
                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.txt"
                    />
                  </label>
                </div>
              </div>
            )}

            <div className="flex flex-col items-start space-y-4 mt-4">
              <div
                className={`rounded-full p-1 bg-gradient-to-r from-[#e0f923] to-[#24C6DC] shadow-lg transition-opacity w-[80%] md:w-auto ${
                  isAnalyzing ? "opacity-60" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className={`flex w-full items-center justify-center gap-3 rounded-full bg-white px-8 py-3 font-bold text-lg text-[#0a2342] transition-all ${
                    isAnalyzing
                      ? "cursor-not-allowed"
                      : "hover:bg-gradient-to-r hover:from-yellow-100 hover:to-teal-100"
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <Wand2 className="h-6 w-6 animate-pulse" />
                      <span>{t.ui.buttonAnalyzing}</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-6 w-6" />
                      <span>{t.ui.buttonAnalyze}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Output */}
          <div className="w-full md:w-1/2">
            <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
              {t.analysisResults.title}
            </h3>
            {isAnalyzing && <p>{t.ui.buttonAnalyzing}</p>}
            {analysisError && (
              <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {analysisError}
              </div>
            )}
            {analysisResult && (
              <div className="w-full border border-gray-200 rounded-lg bg-gray-50 p-6 h-[25rem] overflow-y-auto">
                {analysisResult}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pt-8 mt-8 border-t">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-8 py-3 text-lg font-semibold text-gray-700 bg-white border border-gray-400 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
            {t.ui.buttonBack}
          </button>
          <button
            onClick={handleContinue}
            disabled={isCreatingCV}
            className={`flex items-center gap-2 px-8 py-3 text-lg font-semibold text-white rounded-full transition-colors ${
              isCreatingCV
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-yellow-500 hover:bg-yellow-600"
            }`}
          >
            {isCreatingCV ? t.ui.buttonCreating : t.ui.buttonCreateCV}
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
