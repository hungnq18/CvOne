"use client";

import { InterviewFeedback } from "@/api/aiInterviewApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/providers/global_provider";
import { AlertCircle, CheckCircle2, Lightbulb, TrendingUp, X } from "lucide-react";

interface InterviewSummaryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onShowFeedback?: () => void;
  data: {
    overallFeedback: string;
    averageScore: number;
    totalQuestions: number;
    answeredQuestions: number;
    feedbacks: InterviewFeedback[];
  };
}

const summaryTexts = {
  en: {
    title: "Interview Completed! 🎉",
    subtitle: "Here's your performance summary",
    overallScore: "Overall Score",
    questionsAnswered: "Questions Answered",
    overallFeedback: "Overall Feedback",
    keySuggestions: "Key Suggestions for Improvement",
    allSuggestions: "All Suggestions",
    strengths: "Strengths",
    improvements: "Areas to Improve",
    noSuggestions: "Great job! No major improvements needed.",
    viewDetails: "View Detailed Feedback",
    close: "Close",
    continue: "Continue",
  },
  vi: {
    title: "Hoàn thành phỏng vấn! 🎉",
    subtitle: "Tóm tắt kết quả của bạn",
    overallScore: "Điểm tổng thể",
    questionsAnswered: "Số câu đã trả lời",
    overallFeedback: "Phản hồi tổng thể",
    keySuggestions: "Gợi ý cải thiện chính",
    allSuggestions: "Tất cả gợi ý",
    strengths: "Điểm mạnh",
    improvements: "Cần cải thiện",
    noSuggestions: "Làm tốt lắm! Không cần cải thiện nhiều.",
    viewDetails: "Xem phản hồi chi tiết",
    close: "Đóng",
    continue: "Tiếp tục",
  },
} as const;

export default function InterviewSummaryPopup({
  isOpen,
  onClose,
  onShowFeedback,
  data,
}: InterviewSummaryPopupProps) {
  const { language } = useLanguage();
  const t = summaryTexts[language] ?? summaryTexts.en;

  if (!isOpen) return null;

  // Tổng hợp tất cả các suggestions từ tất cả feedbacks
  const allImprovements = data.feedbacks
    .flatMap((fb) => fb.improvements)
    .filter((imp, index, self) => self.indexOf(imp) === index); // Remove duplicates

  const allStrengths = data.feedbacks
    .flatMap((fb) => fb.strengths)
    .filter((str, index, self) => self.indexOf(str) === index); // Remove duplicates

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 8) return "bg-green-100 border-green-300";
    if (score >= 6) return "bg-yellow-100 border-yellow-300";
    return "bg-red-100 border-red-300";
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
            <p className="text-sm text-gray-600 mt-1">{t.subtitle}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Score Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className={`${getScoreBgColor(data.averageScore)} border-2`}>
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="h-6 w-6" />
                  <span className="text-sm font-medium">{t.overallScore}</span>
                </div>
                <div className={`text-5xl font-bold ${getScoreColor(data.averageScore)}`}>
                  {data.averageScore.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600 mt-1">/ 10</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle2 className="h-6 w-6 text-blue-600" />
                  <span className="text-sm font-medium">{t.questionsAnswered}</span>
                </div>
                <div className="text-5xl font-bold text-blue-600">
                  {data.answeredQuestions}
                </div>
                <div className="text-sm text-gray-600 mt-1">/ {data.totalQuestions}</div>
                <Progress
                  value={(data.answeredQuestions / data.totalQuestions) * 100}
                  className="mt-3 h-2"
                />
              </CardContent>
            </Card>
          </div>

          {/* Overall Feedback */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                {t.overallFeedback}
              </h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {data.overallFeedback}
              </p>
            </CardContent>
          </Card>

          {/* Key Suggestions */}
          {allImprovements.length > 0 && (
            <Card className="border-orange-200 bg-orange-50/50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-orange-800">
                  <AlertCircle className="h-5 w-5" />
                  {t.keySuggestions}
                </h3>
                <ul className="space-y-3">
                  {allImprovements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-200 flex items-center justify-center mt-0.5">
                        <span className="text-orange-800 font-semibold text-xs">
                          {index + 1}
                        </span>
                      </div>
                      <p className="text-gray-700 flex-1">{improvement}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Strengths */}
          {allStrengths.length > 0 && (
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-800">
                  <CheckCircle2 className="h-5 w-5" />
                  {t.strengths}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {allStrengths.map((strength, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-green-100 text-green-800 border-green-300"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {strength}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No suggestions message */}
          {allImprovements.length === 0 && (
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <p className="text-green-800 font-medium">{t.noSuggestions}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            {t.close}
          </Button>
          <div className="flex gap-3">
            {onShowFeedback && (
              <Button
                variant="outline"
                onClick={() => {
                  onClose();
                  onShowFeedback();
                }}
              >
                {t.viewDetails}
              </Button>
            )}
            <Button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {t.continue}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

