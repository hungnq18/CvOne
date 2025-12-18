"use client";

import { aiInterviewApi } from "@/api/aiInterviewApi";
import AiInterviewModal from "@/components/ai-interview/AiInterviewModal";
import InterviewHistory from "@/components/ai-interview/InterviewHistory";
import InterviewSetupModal, { InterviewConfig } from "@/components/ai-interview/InterviewSetupModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRequireLogin } from "@/hooks/requireLogin";
import { notify } from "@/lib/notify";
import { useLanguage } from "@/providers/global_provider";
import { Brain, Clock, History, Play, Sparkles, Star, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";

const aiInterviewTexts = {
  en: {
    headerTitle: "AI Interview Practice",
    headerSubtitle:
      "Practice your interview skills with AI-powered questions tailored to your job description. Get instant feedback and improve your performance.",
    stats: {
      practiceSessions: "Practice Sessions",
      averageScore: "Average Score",
      completed: "Completed",
      inProgress: "In Progress",
    },
    startCard: {
      title: "Start New Interview",
      description:
        "Begin a new AI-powered interview practice session. Upload your job description and get personalized questions.",
      badges: {
        personalized: "Personalized Questions",
        feedback: "Real-time Feedback",
        followUp: "Follow-up Questions",
      },
      cta: "Start Interview Practice",
    },
    historyCard: {
      title: "Interview History",
      description:
        "Review your past interview sessions, track your progress, and see how you've improved over time.",
      badges: {
        tracking: "Progress Tracking",
        analytics: "Performance Analytics",
        history: "Session History",
      },
      cta: "View History",
    },
    featuresTitle: "Why Choose AI Interview Practice?",
    features: [
      {
        title: "Auto-Difficulty Detection",
        description:
          "AI automatically determines interview difficulty based on job requirements and seniority level.",
      },
      {
        title: "AI-Powered Questions",
        description:
          "Personalized questions generated based on your job description and requirements.",
      },
      {
        title: "Real-time Feedback",
        description:
          "Get instant AI feedback on your answers with detailed scoring and suggestions.",
      },
      {
        title: "Interview Simulation",
        description:
          "Practice with realistic interview scenarios and follow-up questions.",
      },
    ],
    howItWorks: {
      title: "How It Works",
      step1Title: "Upload Job Description",
      step1Desc: "Paste the job description you're applying for to get relevant questions.",
      step2Title: "Answer Questions",
      step2Desc: "Practice answering interview questions and get real-time AI feedback.",
      step3Title: "Improve & Repeat",
      step3Desc: "Review feedback, practice more, and track your improvement over time.",
    },
    historyModalTitle: "Interview History",
    historyModalClose: "Close",
  },
  vi: {
    headerTitle: "Luyện phỏng vấn với AI",
    headerSubtitle:
      "Luyện kỹ năng phỏng vấn với bộ câu hỏi được AI tạo ra dựa trên mô tả công việc. Nhận phản hồi tức thì và cải thiện kết quả của bạn.",
    stats: {
      practiceSessions: "Số buổi luyện tập",
      averageScore: "Điểm trung bình",
      completed: "Đã hoàn thành",
      inProgress: "Đang diễn ra",
    },
    startCard: {
      title: "Bắt đầu buổi phỏng vấn mới",
      description:
        "Bắt đầu một buổi luyện phỏng vấn với AI. Tải mô tả công việc và nhận bộ câu hỏi được cá nhân hóa.",
      badges: {
        personalized: "Câu hỏi cá nhân hóa",
        feedback: "Phản hồi theo thời gian thực",
        followUp: "Câu hỏi đào sâu",
      },
      cta: "Bắt đầu luyện phỏng vấn",
    },
    historyCard: {
      title: "Lịch sử phỏng vấn",
      description:
        "Xem lại các buổi phỏng vấn trước đây, theo dõi tiến bộ và cách bạn cải thiện theo thời gian.",
      badges: {
        tracking: "Theo dõi tiến độ",
        analytics: "Phân tích hiệu suất",
        history: "Lịch sử phiên phỏng vấn",
      },
      cta: "Xem lịch sử",
    },
    featuresTitle: "Vì sao nên luyện phỏng vấn với AI?",
    features: [
      {
        title: "Tự động xác định độ khó",
        description:
          "AI tự động xác định mức độ khó của buổi phỏng vấn dựa trên yêu cầu công việc và cấp bậc vị trí.",
      },
      {
        title: "Câu hỏi do AI tạo ra",
        description:
          "Câu hỏi được cá nhân hóa dựa trên mô tả công việc và yêu cầu tuyển dụng.",
      },
      {
        title: "Phản hồi theo thời gian thực",
        description:
          "Nhận phản hồi tức thì cùng điểm số và gợi ý cải thiện cho từng câu trả lời.",
      },
      {
        title: "Mô phỏng buổi phỏng vấn",
        description:
          "Luyện tập với các kịch bản phỏng vấn thực tế và câu hỏi đào sâu tiếp theo.",
      },
    ],
    howItWorks: {
      title: "Quy trình hoạt động",
      step1Title: "Tải mô tả công việc",
      step1Desc: "Dán mô tả công việc bạn muốn ứng tuyển để nhận bộ câu hỏi phù hợp.",
      step2Title: "Trả lời câu hỏi",
      step2Desc: "Luyện tập trả lời câu hỏi phỏng vấn và nhận phản hồi từ AI theo thời gian thực.",
      step3Title: "Cải thiện & lặp lại",
      step3Desc: "Xem lại phản hồi, luyện tập thêm và theo dõi mức độ cải thiện của bạn.",
    },
    historyModalTitle: "Lịch sử phỏng vấn",
    historyModalClose: "Đóng",
  },
} as const;

export default function AiInterviewPage() {
  const { language } = useLanguage();
  const t = aiInterviewTexts[language] ?? aiInterviewTexts.en;

  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [interviewConfig, setInterviewConfig] = useState<InterviewConfig | null>(null);
  const [stats, setStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    averageScore: 0,
    inProgressSessions: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const requireLogin = useRequireLogin();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    // Yêu cầu đăng nhập trước khi gọi backend
    if (!requireLogin()) {
      setIsLoadingStats(false);
      return;
    }

    try {
      const response = await aiInterviewApi.getInterviewHistory();
      if (response.success && response.data) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleStartInterview = (config: InterviewConfig) => {
    setInterviewConfig(config);
    setShowInterviewModal(true);
    setShowSetupModal(false);
  };

  const handleCloseInterview = () => {
    setShowInterviewModal(false);
    setInterviewConfig(null);
    loadStats();
  };

  const handleRetakeInterview = async (sessionId: string) => {
    try {
      const response = await aiInterviewApi.retakeInterviewSession(sessionId);
      if (response.success && response.data) {
        // Tạo config từ session data
        setInterviewConfig({
          jobDescription: response.data.jobDescription,
          jobTitle: response.data.jobTitle,
          companyName: response.data.companyName,
          numberOfQuestions: response.data.totalQuestions,
          sessionData: response.data, // Pass session data để modal có thể sử dụng
        });
        setShowInterviewModal(true);
        setShowHistory(false);
      } else {
        notify.error(response.error || "Failed to retake interview");
      }
    } catch (error) {
      console.error("Error retaking interview:", error);
      notify.error("Failed to retake interview");
    }
  };

  const displayStats = [
    { label: t.stats.practiceSessions, value: stats.totalSessions.toString(), icon: Play },
    {
      label: t.stats.averageScore,
      value: stats.averageScore > 0 ? `${stats.averageScore.toFixed(1)}/10` : "N/A",
      icon: Star,
    },
    { label: t.stats.completed, value: stats.completedSessions.toString(), icon: Clock },
    { label: t.stats.inProgress, value: stats.inProgressSessions.toString(), icon: Brain },
  ];

  return (
    <div className="min-h-screen bg-gray-50 mt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t.headerTitle}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t.headerSubtitle}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {displayStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4 text-center">
                <stat.icon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Start New Interview */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-6 w-6 text-blue-600" />
                {t.startCard.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">{t.startCard.description}</p>
              <div className="space-y-2">
                <Badge variant="outline">{t.startCard.badges.personalized}</Badge>
                <Badge variant="outline">{t.startCard.badges.feedback}</Badge>
                <Badge variant="outline">{t.startCard.badges.followUp}</Badge>
              </div>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  if (!requireLogin()) return;
                  setShowSetupModal(true);
                }}
              >
                {t.startCard.cta}
              </Button>
            </CardContent>
          </Card>

          {/* View History */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-6 w-6 text-green-600" />
                {t.historyCard.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">{t.historyCard.description}</p>
              <div className="space-y-2">
                <Badge variant="outline">{t.historyCard.badges.tracking}</Badge>
                <Badge variant="outline">{t.historyCard.badges.analytics}</Badge>
                <Badge variant="outline">{t.historyCard.badges.history}</Badge>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  if (!requireLogin()) return;
                  setShowHistory(true);
                }}
              >
                {t.historyCard.cta}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">{t.featuresTitle}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.features.map((feature, index) => {
              const Icon = [Sparkles, Brain, TrendingUp, Users][index];
              return (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <Icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* How It Works */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center text-2xl">{t.howItWorks.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{t.howItWorks.step1Title}</h3>
                <p className="text-gray-600">{t.howItWorks.step1Desc}</p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{t.howItWorks.step2Title}</h3>
                <p className="text-gray-600">{t.howItWorks.step2Desc}</p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{t.howItWorks.step3Title}</h3>
                <p className="text-gray-600">{t.howItWorks.step3Desc}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        <InterviewSetupModal
          isOpen={showSetupModal}
          onClose={() => setShowSetupModal(false)}
          onStartInterview={handleStartInterview}
        />

        {interviewConfig && (
          <AiInterviewModal
            isOpen={showInterviewModal}
            onClose={handleCloseInterview}
            jobDescription={interviewConfig.jobDescription}
            jobTitle={interviewConfig.jobTitle}
            companyName={interviewConfig.companyName}
            numberOfQuestions={interviewConfig.numberOfQuestions}
            sessionData={interviewConfig.sessionData}
          />
        )}

        {showHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold">{t.historyModalTitle}</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)}>
                  ×
                </Button>
              </div>
              <div className="p-6">
                <InterviewHistory 
                  onRetakeInterview={handleRetakeInterview}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
