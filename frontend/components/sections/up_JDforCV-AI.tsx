"use client";

import { analyzeJD } from "@/api/cvapi";
import { toast } from "@/hooks/use-toast";
import { useCV } from "@/providers/cv-provider";
import { useLanguage } from "@/providers/global_provider";
import { useRouter } from "next/navigation";
import { FC, ReactNode, useState } from "react";

// --- ĐỐI TƯỢNG TRANSLATIONS ---
const translations = {
  en: {
    jdAnalysis: {
      ui: {
        description:
          "Add job descriptions, requirements, and responsibilities to help AI better understand the position you want to create a CV for.",
        label: "JOB DESCRIPTION",
        placeholder:
          "Paste the job description, requirements, and responsibilities here.",
        buttonAnalyzing: "Analyzing...",
        buttonAnalyze: "Analyze Job Description with AI",
      },
      alerts: {
        emptyDescription: "Please enter a job description before analyzing.",
        analysisError: "An error occurred during analysis. Please try again.",
        tokenError:
          "Not enough AI tokens. Please top up to continue using AI features.",
      },
      results: {
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
        suggestionsTitle: "💡 CV Suggestions",
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
    jdAnalysis: {
      ui: {
        description:
          "Thêm mô tả công việc, yêu cầu và trách nhiệm để giúp AI hiểu rõ hơn về vị trí bạn muốn tạo CV.",
        label: "MÔ TẢ CÔNG VIỆC",
        placeholder:
          "Dán nội dung mô tả công việc, yêu cầu và trách nhiệm vào đây.",
        buttonAnalyzing: "Đang phân tích...",
        buttonAnalyze: "Phân tích Mô tả công việc bằng AI",
      },
      alerts: {
        emptyDescription: "Vui lòng nhập mô tả công việc trước khi phân tích.",
        analysisError: "Có lỗi xảy ra khi phân tích. Vui lòng thử lại.",
        tokenError:
          "Không đủ token AI. Vui lòng nạp thêm để tiếp tục sử dụng tính năng AI.",
      },
      results: {
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

interface UpJdStepProps {}

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
const formatAnalysisResult = (
  result: any,
  t_results: typeof translations.vi.jdAnalysis.results
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
    
    // Use AI-generated suggestions from backend
    console.log("🔍 [Up JD Format] Full result object:", {
      resultKeys: Object.keys(result || {}),
      result: result,
      cvSuggestions: result?.cvSuggestions,
      cvSuggestionsType: typeof result?.cvSuggestions,
      isArray: Array.isArray(result?.cvSuggestions),
    });
    
    const suggestions = result.cvSuggestions || [];
    console.log("🔍 [Up JD Format] Suggestions in formatAnalysisResult:", {
      hasCvSuggestions: !!result.cvSuggestions,
      cvSuggestionsLength: result.cvSuggestions?.length || 0,
      suggestionsCount: suggestions.length,
      suggestionsPreview: suggestions.slice(0, 2).map((s: string) => s?.substring(0, 80)),
      fullSuggestions: suggestions,
    });
    
    if (!result.cvSuggestions || result.cvSuggestions.length === 0) {
      console.warn("⚠️ [Up JD Format] No cvSuggestions found in result!", {
        resultKeys: Object.keys(result || {}),
        result: result,
      });
    }

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
        {suggestions.length > 0 && (
          <AnalysisSection icon="💡" title={t_results.suggestionsTitle}>
            <AnalysisList items={suggestions} />
          </AnalysisSection>
        )}
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

const UpJdStep: React.FC<UpJdStepProps> = () => {
  const { language } = useLanguage();
  const t = translations[language].jdAnalysis;
  const router = useRouter();

  const { jobDescription, setJobDescription, setJobAnalysis } = useCV();

  const [analysisResult, setAnalysisResult] = useState<ReactNode | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string>("");

  const maxLength = 5000;
  const currentLength = jobDescription.length;

  const handleAnalyzeAI = async () => {
    if (!jobDescription.trim()) {
      setAnalysisError(t.alerts.emptyDescription);
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError("");
    setAnalysisResult(null);

    try {
      const result = await analyzeJD(jobDescription);
      console.log("🔍 [Up JD Analysis] Full API response:", result);
      
      // Backend returns { analyzedJob: {...}, total_tokens: ... }
      // Extract analyzedJob and save it
      const analyzedJob = result?.analyzedJob || result;
      console.log("🔍 [Up JD Analysis] Analyzed job data:", {
        hasAnalyzedJob: !!result?.analyzedJob,
        analyzedJobKeys: Object.keys(analyzedJob || {}),
        cvSuggestions: analyzedJob?.cvSuggestions,
        cvSuggestionsCount: analyzedJob?.cvSuggestions?.length || 0,
        cvSuggestionsPreview: analyzedJob?.cvSuggestions?.slice(0, 2),
        fullCvSuggestions: analyzedJob?.cvSuggestions,
      });
      
      // Save only analyzedJob, not the whole response
      setJobAnalysis(analyzedJob);
      
      if (analyzedJob?.cvSuggestions) {
        console.log("✅ [Up JD Analysis] CV Suggestions received:", {
          count: analyzedJob.cvSuggestions.length,
          suggestions: analyzedJob.cvSuggestions.map((s: string, i: number) => ({
            index: i,
            length: s.length,
            preview: s.substring(0, 100),
            containsGenericTerms: /relevant|modern|various|general|focus on|emphasize/i.test(s),
          })),
        });
      } else {
        console.warn("⚠️ [Up JD Analysis] No cvSuggestions in response!", {
          analyzedJobKeys: Object.keys(analyzedJob || {}),
          analyzedJob: analyzedJob,
        });
      }
      
      // Double check before formatting
      console.log("🔍 [Up JD Analysis] Before formatAnalysisResult:", {
        analyzedJobKeys: Object.keys(analyzedJob || {}),
        hasCvSuggestions: !!analyzedJob?.cvSuggestions,
        cvSuggestionsCount: analyzedJob?.cvSuggestions?.length || 0,
        cvSuggestions: analyzedJob?.cvSuggestions,
      });
      
      const formattedResult = formatAnalysisResult(analyzedJob, t.results);
      setAnalysisResult(formattedResult);
    } catch (error: any) {
      console.error("Error analyzing job description:", error);
      const message: string =
        (error?.data && typeof error.data.message === "string"
          ? error.data.message
          : error?.message) || "";

      if (message.includes("Not enough tokens")) {
        toast({
          title: "CVone",
          description: language === "vi"
            ? "Không đủ token AI. Vui lòng nạp thêm để tiếp tục sử dụng tính năng AI."
            : "Not enough AI tokens. Please top up to continue using AI features.",
          variant: "destructive",
        });
        setTimeout(() => {
          router.push("/user/wallet");
        }, 1000);
      } else {
        setAnalysisError(t.alerts.analysisError);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600">{t.ui.description}</p>
          </div>
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
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {currentLength} / {maxLength}
              </div>
            </div>
          </div>
        </div>
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
            {isAnalyzing ? t.ui.buttonAnalyzing : t.ui.buttonAnalyze}
          </button>

          {analysisError && (
            <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {analysisError}
            </div>
          )}

          {analysisResult && (
            <div className="w-full max-w-2xl min-h-[200px] border border-gray-200 rounded-lg bg-gray-50 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                {t.results.title}
              </h3>
              {analysisResult}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpJdStep;
