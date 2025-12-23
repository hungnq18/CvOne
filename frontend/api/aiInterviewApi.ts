import { fetchWithAuth } from "./apiClient";
import { API_ENDPOINTS } from "./apiConfig";

export interface CreateInterviewRequest {
  jobDescription: string;
  jobTitle?: string;
  companyName?: string;
  numberOfQuestions?: number;
  // difficulty không cần nữa - tự động xác định từ JD
}

export interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  tips?: string[];
}

export interface InterviewSession {
  sessionId: string;
  jobDescription: string;
  jobTitle?: string;
  companyName?: string;
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  totalQuestions: number;
  completedQuestions: number;
  status: string;
  difficulty: "easy" | "medium" | "hard"; // Auto-determined từ JD
  language?: string; // Language detected from JD (vi-VN, en-US, ja-JP, etc.)
  createdAt: Date;
  averageScore?: number;
  overallFeedback?: string;
  feedbacks?: InterviewFeedback[];
  completedAt?: Date;
}

export interface SubmitAnswerRequest {
  questionId: string;
  answer: string;
}

export interface InterviewFeedback {
  questionId: string;
  userAnswer: string;
  score: number;
  feedback: string;
  suggestions: string[];
  strengths: string[];
  improvements: string[];
  evaluatedAt?: Date | string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class AiInterviewApi {
  /**
   * Tạo buổi phỏng vấn mới
   */
  async createInterviewSession(
    request: CreateInterviewRequest
  ): Promise<ApiResponse<InterviewSession>> {
    try {
      const response = await fetchWithAuth(
        API_ENDPOINTS.AI_INTERVIEW.CREATE_SESSION,
        {
          method: "POST",
          body: JSON.stringify(request),
        }
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.error || "Failed to create interview session",
      };
    }
  }

  /**
   * Lấy câu hỏi hiện tại
   */
  async getCurrentQuestion(
    sessionId: string
  ): Promise<ApiResponse<InterviewQuestion & { tips: string[] }>> {
    try {
      const response = await fetchWithAuth(
        API_ENDPOINTS.AI_INTERVIEW.GET_CURRENT_QUESTION(sessionId)
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to get current question",
      };
    }
  }

  /**
   * Lấy session theo ID
   */
  async getSession(sessionId: string): Promise<ApiResponse<InterviewSession>> {
    try {
      const response = await fetchWithAuth(
        API_ENDPOINTS.AI_INTERVIEW.GET_SESSION(sessionId)
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to get session",
      };
    }
  }

  /**
   * Nộp câu trả lời
   */
  async submitAnswer(
    sessionId: string,
    request: SubmitAnswerRequest
  ): Promise<
    ApiResponse<{
      feedback: InterviewFeedback;
      nextQuestionAvailable: boolean;
      totalQuestions: number;
      answeredQuestions: number;
    }>
  > {
    try {
      const response = await fetchWithAuth(
        API_ENDPOINTS.AI_INTERVIEW.SUBMIT_ANSWER(sessionId),
        {
          method: "POST",
          body: JSON.stringify(request),
        }
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to submit answer",
      };
    }
  }

  /**
   * Tạo câu hỏi follow-up
   */
  async generateFollowUpQuestion(
    sessionId: string,
    questionId: string,
    userAnswer: string
  ): Promise<
    ApiResponse<{
      followUpQuestion: string;
    }>
  > {
    try {
      const response = await fetchWithAuth(
        API_ENDPOINTS.AI_INTERVIEW.FOLLOW_UP_QUESTION(sessionId),
        {
          method: "POST",
          body: JSON.stringify({ questionId, userAnswer }),
        }
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.error ||
          "Failed to generate follow-up question",
      };
    }
  }

  /**
   * Lấy câu trả lời mẫu
   */
  async getSampleAnswer(
    sessionId: string,
    questionId: string
  ): Promise<
    ApiResponse<{
      sampleAnswer: string;
    }>
  > {
    try {
      const response = await fetchWithAuth(
        API_ENDPOINTS.AI_INTERVIEW.SAMPLE_ANSWER(sessionId, questionId)
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to get sample answer",
      };
    }
  }

  /**
   * Hoàn thành session
   */
  async completeSession(sessionId: string): Promise<
    ApiResponse<{
      sessionId: string;
      overallFeedback: string;
      averageScore: number;
      totalQuestions: number;
      answeredQuestions: number;
      feedbacks: InterviewFeedback[];
      completedAt: Date;
      sessionCompleted: boolean;
    }>
  > {
    try {
      const response = await fetchWithAuth(
        API_ENDPOINTS.AI_INTERVIEW.COMPLETE_SESSION(sessionId),
        {
          method: "POST",
        }
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to complete session",
      };
    }
  }

  /**
   * Retake interview với cùng questions từ session cũ
   */
  async retakeInterviewSession(
    sessionId: string
  ): Promise<ApiResponse<InterviewSession>> {
    try {
      const response = await fetchWithAuth(
        API_ENDPOINTS.AI_INTERVIEW.RETAKE_SESSION(sessionId),
        {
          method: "POST",
        }
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.error || "Failed to retake interview session",
      };
    }
  }

  /**
   * Lấy lịch sử phỏng vấn
   */
  async getInterviewHistory(
    status?: "in-progress" | "completed" | "abandoned"
  ): Promise<
    ApiResponse<{
      sessions: Array<{
        sessionId: string;
        jobDescription: string;
        jobTitle?: string;
        companyName?: string;
        difficulty: "easy" | "medium" | "hard";
        status: string;
        totalQuestions: number;
        answeredQuestions: number;
        averageScore?: number;
        createdAt: Date;
        completedAt?: Date;
      }>;
      stats: {
        totalSessions: number;
        completedSessions: number;
        inProgressSessions: number;
        averageScore: number;
        recentSessions: any[];
      };
    }>
  > {
    try {
      const url = status
        ? `${API_ENDPOINTS.AI_INTERVIEW.GET_HISTORY}?status=${status}`
        : API_ENDPOINTS.AI_INTERVIEW.GET_HISTORY;
      const response = await fetchWithAuth(url);
      return response;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to get interview history",
      };
    }
  }
}

export const aiInterviewApi = new AiInterviewApi();
