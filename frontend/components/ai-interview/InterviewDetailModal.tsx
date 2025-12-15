"use client";

import { aiInterviewApi, InterviewFeedback, InterviewQuestion } from "@/api/aiInterviewApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/providers/global_provider";
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    Clock,
    MessageSquare,
    Star,
    X
} from "lucide-react";
import { useEffect, useState } from "react";

interface InterviewDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
}

interface SessionDetail {
  sessionId: string;
  jobTitle?: string;
  companyName?: string;
  questions: InterviewQuestion[];
  feedbacks: InterviewFeedback[];
  averageScore: number;
  totalQuestions: number;
  completedQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard';
  status: string;
  overallFeedback?: string;
  createdAt: Date;
  completedAt?: Date;
}

const detailTexts = {
  en: {
    title: "Interview Details",
    loading: "Loading interview details...",
    error: "Failed to load interview details",
    overallScore: "Overall Score",
    questionsAnswered: "Questions Answered",
    difficulty: "Difficulty",
    status: "Status",
    completed: "Completed",
    inProgress: "In Progress",
    abandoned: "Abandoned",
    questions: "Questions",
    question: "Question",
    answer: "Your Answer",
    score: "Score",
    feedback: "Feedback",
    strengths: "Strengths",
    improvements: "Improvements",
    timeSpent: "Time Spent",
    evaluatedAt: "Evaluated At",
    overallFeedback: "Overall Feedback",
    noFeedback: "No feedback available",
    close: "Close",
    createdAt: "Created At",
    completedAt: "Completed At",
  },
  vi: {
    title: "Chi tiết phỏng vấn",
    loading: "Đang tải chi tiết phỏng vấn...",
    error: "Không thể tải chi tiết phỏng vấn",
    overallScore: "Điểm tổng thể",
    questionsAnswered: "Số câu đã trả lời",
    difficulty: "Độ khó",
    status: "Trạng thái",
    completed: "Đã hoàn thành",
    inProgress: "Đang diễn ra",
    abandoned: "Đã hủy",
    questions: "Câu hỏi",
    question: "Câu hỏi",
    answer: "Câu trả lời của bạn",
    score: "Điểm số",
    feedback: "Phản hồi",
    strengths: "Điểm mạnh",
    improvements: "Cần cải thiện",
    timeSpent: "Thời gian",
    evaluatedAt: "Thời gian đánh giá",
    overallFeedback: "Phản hồi tổng thể",
    noFeedback: "Không có phản hồi",
    close: "Đóng",
    createdAt: "Thời gian tạo",
    completedAt: "Thời gian hoàn thành",
  },
} as const;

export default function InterviewDetailModal({
  isOpen,
  onClose,
  sessionId,
}: InterviewDetailModalProps) {
  const { language } = useLanguage();
  const t = detailTexts[language] ?? detailTexts.en;

  const [sessionDetail, setSessionDetail] = useState<SessionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && sessionId) {
      loadSessionDetail();
    }
  }, [isOpen, sessionId]);

  const loadSessionDetail = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await aiInterviewApi.getSession(sessionId);
      if (response.success && response.data) {
        setSessionDetail(response.data as any);
      } else {
        setError(response.error || t.error);
      }
    } catch (err: any) {
      console.error("Error loading session detail:", err);
      setError(err.message || t.error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 6) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
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

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "N/A";
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return "N/A";
      return dateObj.toLocaleString(
        language === "vi" ? "vi-VN" : "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  const formatDuration = (startDate: Date | string | undefined, endDate: Date | string | undefined) => {
    if (!startDate || !endDate) return "N/A";
    try {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      if (isNaN(start) || isNaN(end)) return "N/A";
      const diff = end - start;
      if (diff < 0) return "N/A";
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      return `${minutes}m ${seconds}s`;
    } catch (error) {
      console.error("Error formatting duration:", error);
      return "N/A";
    }
  };

  const getQuestionTimeSpent = (questionId: string, questionIndex: number) => {
    if (!sessionDetail) return "N/A";
    
    const feedback = sessionDetail.feedbacks?.find((fb) => fb.questionId === questionId);
    if (!feedback || !feedback.evaluatedAt) return "N/A";

    try {
      // Tính thời gian từ câu hỏi trước đó hoặc từ khi bắt đầu session
      let startTime: Date;
      if (questionIndex === 0) {
        startTime = new Date(sessionDetail.createdAt);
      } else {
        // Tìm feedback của câu hỏi trước đó
        const prevQuestion = sessionDetail.questions?.[questionIndex - 1];
        if (prevQuestion) {
          const prevFeedback = sessionDetail.feedbacks?.find(
            (fb) => fb.questionId === prevQuestion.id
          );
          startTime = prevFeedback?.evaluatedAt 
            ? new Date(prevFeedback.evaluatedAt)
            : new Date(sessionDetail.createdAt);
        } else {
          startTime = new Date(sessionDetail.createdAt);
        }
      }

      const endTime = new Date(feedback.evaluatedAt);
      const diff = endTime.getTime() - startTime.getTime();
      if (isNaN(diff) || diff < 0) return "N/A";
      
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      return `${minutes}m ${seconds}s`;
    } catch (error) {
      console.error("Error calculating time spent:", error);
      return "N/A";
    }
  };

  if (!isOpen || !sessionId) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
            {sessionDetail && (
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getDifficultyColor(sessionDetail.difficulty)}>
                  {sessionDetail.difficulty}
                </Badge>
                <Badge variant="outline">
                  {sessionDetail.status === "completed"
                    ? t.completed
                    : sessionDetail.status === "in-progress"
                    ? t.inProgress
                    : t.abandoned}
                </Badge>
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">{t.loading}</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-600">{error}</p>
                <Button onClick={loadSessionDetail} className="mt-4">
                  Retry
                </Button>
              </div>
            </div>
          ) : sessionDetail ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Star className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm font-medium">{t.overallScore}</span>
                    </div>
                    <div className="text-3xl font-bold text-yellow-600">
                      {sessionDetail.averageScore ? sessionDetail.averageScore.toFixed(1) : "N/A"}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">/ 10</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium">{t.questionsAnswered}</span>
                    </div>
                    <div className="text-3xl font-bold text-blue-600">
                      {sessionDetail.completedQuestions}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      / {sessionDetail.totalQuestions}
                    </div>
                    <Progress
                      value={(sessionDetail.completedQuestions / sessionDetail.totalQuestions) * 100}
                      className="mt-2 h-2"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">{t.timeSpent}</span>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {formatDuration(
                        sessionDetail.createdAt,
                        sessionDetail.completedAt
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Overall Feedback */}
              {sessionDetail.overallFeedback && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      {t.overallFeedback}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {sessionDetail.overallFeedback}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Questions List */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.questions}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {sessionDetail.questions && sessionDetail.questions.length > 0 ? (
                      sessionDetail.questions.map((question, index) => {
                      const feedback = sessionDetail.feedbacks?.find(
                        (fb) => fb.questionId === question.id
                      );
                      const timeSpent = getQuestionTimeSpent(question.id, index);

                      return (
                        <div
                          key={question.id}
                          className="border rounded-lg p-4 space-y-4"
                        >
                          {/* Question Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-lg">
                                  {t.question} {index + 1}:
                                </span>
                                <Badge variant="outline">{question.category}</Badge>
                                <Badge className={getDifficultyColor(question.difficulty)}>
                                  {question.difficulty}
                                </Badge>
                              </div>
                              <p className="text-gray-700 mb-2">{question.question}</p>
                            </div>
                            {feedback && (
                              <div
                                className={`px-4 py-2 rounded-lg border-2 font-bold text-lg ${getScoreColor(
                                  feedback.score
                                )}`}
                              >
                                {feedback.score}/10
                              </div>
                            )}
                          </div>

                          {/* Answer */}
                          {feedback && (
                            <div>
                              <h4 className="font-semibold text-sm text-gray-600 mb-1">
                                {t.answer}:
                              </h4>
                              <p className="text-gray-700 bg-gray-50 p-3 rounded border">
                                {feedback.userAnswer}
                              </p>
                            </div>
                          )}

                          {/* Feedback */}
                          {feedback ? (
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-semibold text-sm text-gray-600 mb-1">
                                  {t.feedback}:
                                </h4>
                                <p className="text-gray-700 bg-blue-50 p-3 rounded border border-blue-200">
                                  {feedback.feedback}
                                </p>
                              </div>

                              {/* Strengths */}
                              {feedback.strengths && feedback.strengths.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-sm text-green-700 mb-2 flex items-center gap-1">
                                    <CheckCircle2 className="h-4 w-4" />
                                    {t.strengths}:
                                  </h4>
                                  <ul className="space-y-1">
                                    {feedback.strengths.map((strength, i) => (
                                      <li
                                        key={i}
                                        className="flex items-start gap-2 text-sm text-green-700"
                                      >
                                        <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                        <span>{strength}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Improvements */}
                              {feedback.improvements && feedback.improvements.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-sm text-orange-700 mb-2 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {t.improvements}:
                                  </h4>
                                  <ul className="space-y-1">
                                    {feedback.improvements.map((improvement, i) => (
                                      <li
                                        key={i}
                                        className="flex items-start gap-2 text-sm text-orange-700"
                                      >
                                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                        <span>{improvement}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Time Info */}
                              <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {t.timeSpent}: {timeSpent}
                                  </span>
                                </div>
                                {feedback.evaluatedAt && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                      {t.evaluatedAt}: {formatDate(feedback.evaluatedAt)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500 text-sm">
                              {t.noFeedback}
                            </div>
                          )}
                        </div>
                      );
                    })
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        {t.noFeedback}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t bg-gray-50">
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
            {t.close}
          </Button>
        </div>
      </div>
    </div>
  );
}

