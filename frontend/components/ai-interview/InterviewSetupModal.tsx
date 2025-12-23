"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/providers/global_provider";
import { Briefcase, FileText, Play, Settings, Sparkles, X } from "lucide-react";
import { useState } from "react";

interface InterviewSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartInterview: (config: InterviewConfig) => void;
}

export interface InterviewConfig {
  jobDescription: string;
  jobTitle?: string;
  companyName?: string;
  numberOfQuestions: number;
  sessionData?: any; // Session data từ retake (optional)
}

const setupTexts = {
  en: {
    title: "AI Interview Setup",
    jobInfoTitle: "Job Information",
    jobTitleLabel: "Job Title",
    jobTitleOptional: "(Optional)",
    jobTitlePlaceholder: "e.g. Senior Backend Developer",
    companyNameLabel: "Company Name",
    companyNameOptional: "(Optional)",
    companyNamePlaceholder: "e.g. Google",
    jobDescriptionTitle: "Job Description",
    jobDescriptionLabel: "Paste the job description you want to practice for:",
    jobDescriptionPlaceholder:
      "Paste the job description here. The AI will analyze it and automatically determine the appropriate difficulty level...",
    settingsTitle: "Interview Settings",
    questionCountLabel: "Number of Questions",
    questionCounts: {
      q5: "5 questions (Quick practice)",
      q10: "10 questions (Standard session)",
      q15: "15 questions (Comprehensive session)",
      q20: "20 questions (Full interview simulation)",
    },
    featuresTitle: "AI Interview Features:",
    features: [
      "Auto-determined difficulty from job description",
      "Personalized questions based on job requirements",
      "Real-time AI feedback and scoring",
      "Sample answers and tips",
      "Follow-up questions for deeper discussion",
      "Overall performance analysis",
    ],
    cancel: "Cancel",
    start: "Start AI Interview",
    starting: "Starting...",
  },
  vi: {
    title: "Thiết lập phỏng vấn AI",
    jobInfoTitle: "Thông tin công việc",
    jobTitleLabel: "Chức danh",
    jobTitleOptional: "(Không bắt buộc)",
    jobTitlePlaceholder: "VD: Senior Backend Developer",
    companyNameLabel: "Tên công ty",
    companyNameOptional: "(Không bắt buộc)",
    companyNamePlaceholder: "VD: Google",
    jobDescriptionTitle: "Mô tả công việc",
    jobDescriptionLabel: "Dán mô tả công việc bạn muốn luyện phỏng vấn:",
    jobDescriptionPlaceholder:
      "Dán mô tả công việc vào đây. AI sẽ phân tích và tự động xác định mức độ phù hợp cho buổi phỏng vấn...",
    settingsTitle: "Cài đặt phỏng vấn",
    questionCountLabel: "Số lượng câu hỏi",
    questionCounts: {
      q5: "5 câu hỏi (Luyện nhanh)",
      q10: "10 câu hỏi (Phiên tiêu chuẩn)",
      q15: "15 câu hỏi (Phiên đầy đủ)",
      q20: "20 câu hỏi (Mô phỏng phỏng vấn thực)",
    },
    featuresTitle: "Tính năng của AI Interview:",
    features: [
      "Tự động xác định độ khó từ mô tả công việc",
      "Câu hỏi cá nhân hóa theo yêu cầu công việc",
      "Phản hồi và chấm điểm theo thời gian thực",
      "Câu trả lời mẫu và gợi ý cải thiện",
      "Câu hỏi đào sâu cho thảo luận",
      "Phân tích hiệu suất tổng thể",
    ],
    cancel: "Hủy",
    start: "Bắt đầu phỏng vấn AI",
    starting: "Đang khởi tạo...",
  },
} as const;

const questionCountValues = [5, 10, 15, 20] as const;

export default function InterviewSetupModal({
  isOpen,
  onClose,
  onStartInterview,
}: InterviewSetupModalProps) {
  const { language } = useLanguage();
  const t = setupTexts[language] ?? setupTexts.en;

  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState<5 | 10 | 15 | 20>(
    10
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleStartInterview = async () => {
    if (!jobDescription.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const config: InterviewConfig = {
        jobDescription: jobDescription.trim(),
        jobTitle: jobTitle.trim() || undefined,
        companyName: companyName.trim() || undefined,
        numberOfQuestions,
      };

      onStartInterview(config);
      onClose();
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Play className="h-6 w-6 text-blue-600" />
            {t.title}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Job Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                {t.jobInfoTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">
                    {t.jobTitleLabel}{" "}
                    <span className="text-gray-400">{t.jobTitleOptional}</span>
                  </Label>
                  <Input
                    id="jobTitle"
                    placeholder={t.jobTitlePlaceholder}
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    {t.companyNameLabel}{" "}
                    <span className="text-gray-400">
                      {t.companyNameOptional}
                    </span>
                  </Label>
                  <Input
                    id="companyName"
                    placeholder={t.companyNamePlaceholder}
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t.jobDescriptionTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="jobDescription">{t.jobDescriptionLabel}</Label>
                <Textarea
                  id="jobDescription"
                  placeholder={t.jobDescriptionPlaceholder}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[200px]"
                />
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Sparkles className="h-4 w-4" />
                  <p>
                    <strong>AI Auto-Difficulty:</strong>{" "}
                    {language === "vi"
                      ? "Mức độ khó của buổi phỏng vấn sẽ được tự động xác định dựa trên yêu cầu kinh nghiệm và cấp bậc vị trí."
                      : "Interview difficulty will be automatically determined based on experience requirements and role seniority."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interview Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {t.settingsTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Number of Questions */}
              <div className="space-y-2">
                <Label htmlFor="questionCount">{t.questionCountLabel}</Label>
                <Select
                  value={numberOfQuestions.toString()}
                  onValueChange={(value) =>
                    setNumberOfQuestions(parseInt(value) as 5 | 10 | 15 | 20)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {questionCountValues.map((value) => (
                      <SelectItem key={value} value={value.toString()}>
                        {t.questionCounts[`q${value}` as const]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Features Info */}
          <Alert>
            <AlertDescription>
              <strong>{t.featuresTitle}</strong>
              <ul className="mt-2 space-y-1 text-sm">
                {t.features.map((item, idx) => (
                  <li key={idx}>
                    {idx === 0 ? "✨ " : "• "}
                    {item}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              {t.cancel}
            </Button>
            <Button
              onClick={handleStartInterview}
              disabled={!jobDescription.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? t.starting : t.start}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
