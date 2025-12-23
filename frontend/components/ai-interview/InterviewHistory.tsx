"use client";

import { aiInterviewApi } from "@/api/aiInterviewApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/providers/global_provider";
import { Calendar, Eye, RotateCcw, Star, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import InterviewDetailModal from "./InterviewDetailModal";

interface InterviewSession {
  id: string;
  jobTitle: string;
  company: string;
  completedAt: string;
  totalQuestions: number;
  completedQuestions: number;
  averageScore: number;
  difficulty: "easy" | "medium" | "hard";
  duration: number; // in minutes
}

interface InterviewHistoryProps {
  onViewDetails?: (sessionId: string) => void;
  onRetakeInterview?: (sessionId: string) => void;
}

const historyTexts = {
  en: {
    stats: {
      totalSessions: "Total Sessions",
      averageScore: "Average Score",
      completed: "Completed",
    },
    listTitle: "Interview History",
    emptyTitle: "No Interview Sessions Yet",
    emptyDesc:
      "Start your first AI interview practice session to see your progress here.",
    emptyCta: "Start First Interview",
    difficulty: {
      easy: "easy",
      medium: "medium",
      hard: "hard",
    },
    view: "View",
    retake: "Retake",
  },
  vi: {
    stats: {
      totalSessions: "Tổng số phiên",
      averageScore: "Điểm trung bình",
      completed: "Đã hoàn thành",
    },
    listTitle: "Lịch sử phỏng vấn",
    emptyTitle: "Chưa có phiên phỏng vấn nào",
    emptyDesc:
      "Hãy bắt đầu buổi phỏng vấn AI đầu tiên để xem tiến trình của bạn tại đây.",
    emptyCta: "Bắt đầu phỏng vấn đầu tiên",
    difficulty: {
      easy: "dễ",
      medium: "trung bình",
      hard: "khó",
    },
    view: "Xem",
    retake: "Luyện lại",
  },
} as const;

export default function InterviewHistory({
  onViewDetails,
  onRetakeInterview,
}: InterviewHistoryProps) {
  const { language } = useLanguage();
  const t = historyTexts[language] ?? historyTexts.en;

  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    averageScore: 0,
    totalTime: 0,
  });
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadInterviewHistory();
  }, []);

  const loadInterviewHistory = async () => {
    setIsLoading(true);
    try {
      const response = await aiInterviewApi.getInterviewHistory();
      if (response.success && response.data) {
        const transformedSessions: InterviewSession[] =
          response.data.sessions.map((s) => ({
            id: s.sessionId,
            jobTitle:
              s.jobTitle ||
              (language === "vi" ? "Chưa có tiêu đề" : "Untitled Position"),
            company:
              s.companyName ||
              (language === "vi" ? "Công ty chưa xác định" : "Unknown Company"),
            completedAt: s.completedAt
              ? new Date(s.completedAt).toISOString()
              : new Date(s.createdAt).toISOString(),
            totalQuestions: s.totalQuestions,
            completedQuestions: s.answeredQuestions,
            averageScore: s.averageScore || 0,
            difficulty: s.difficulty,
            duration: 0,
          }));

        setSessions(transformedSessions);
        setStats({
          totalSessions: response.data.stats.totalSessions,
          averageScore: response.data.stats.averageScore,
          totalTime: 0,
        });
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === "vi" ? "vi-VN" : "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderDifficultyLabel = (difficulty: "easy" | "medium" | "hard") => {
    return t.difficulty[difficulty];
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">{t.stats.totalSessions}</p>
                <p className="text-2xl font-bold">{stats.totalSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">{t.stats.averageScore}</p>
                <p className="text-2xl font-bold">
                  {stats.averageScore > 0
                    ? `${stats.averageScore.toFixed(1)}/10`
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">{t.stats.completed}</p>
                <p className="text-2xl font-bold">{stats.totalSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interview Sessions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t.listTitle}</h3>

        {sessions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t.emptyTitle}
              </h3>
              <p className="text-gray-600 mb-4">{t.emptyDesc}</p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                {t.emptyCta}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <Card
                key={session.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-lg">
                          {session.jobTitle}
                        </h4>
                        <Badge
                          className={getDifficultyColor(session.difficulty)}
                        >
                          {renderDifficultyLabel(session.difficulty)}
                        </Badge>
                      </div>

                      <p className="text-gray-600 text-sm mb-3">
                        {session.company}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-xs">
                            {formatDate(session.completedAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-gray-400" />
                          <span className={getScoreColor(session.averageScore)}>
                            {session.averageScore > 0
                              ? `${session.averageScore.toFixed(1)}/10`
                              : "N/A"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">Progress:</span>
                          <span>
                            {session.completedQuestions}/
                            {session.totalQuestions}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <Progress
                          value={
                            (session.completedQuestions /
                              session.totalQuestions) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSessionId(session.id);
                          setShowDetailModal(true);
                          onViewDetails?.(session.id);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {t.view}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRetakeInterview?.(session.id)}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        {t.retake}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <InterviewDetailModal
        isOpen={showDetailModal && !!selectedSessionId}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedSessionId(null);
        }}
        sessionId={selectedSessionId || ""}
      />
    </div>
  );
}
