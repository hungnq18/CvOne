import { fetchWithAuth } from './apiClient';

export interface CreateInterviewRequest {
  jobDescription: string;
  numberOfQuestions?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tips?: string[];
}

export interface InterviewSession {
  sessionId: string;
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  totalQuestions: number;
  completedQuestions: number;
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
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class AiInterviewApi {
  private baseUrl = '/ai-interview';

  /**
   * Tạo buổi phỏng vấn mới
   */
  async createInterviewSession(request: CreateInterviewRequest): Promise<ApiResponse<InterviewSession>> {
    try {
      const response = await fetchWithAuth(`${this.baseUrl}/create-session`, {
        method: 'POST',
        body: JSON.stringify(request)
      });
      return response;
    } catch (error: any) {
      console.error('Error creating interview session:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create interview session'
      };
    }
  }

  /**
   * Lấy câu hỏi hiện tại
   */
  async getCurrentQuestion(sessionId: string): Promise<ApiResponse<InterviewQuestion & { tips: string[] }>> {
    try {
      const response = await fetchWithAuth(`${this.baseUrl}/session/${sessionId}/current-question`);
      return response;
    } catch (error: any) {
      console.error('Error getting current question:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get current question'
      };
    }
  }

  /**
   * Nộp câu trả lời
   */
  async submitAnswer(sessionId: string, request: SubmitAnswerRequest): Promise<ApiResponse<{
    feedback: InterviewFeedback;
    nextQuestionAvailable: boolean;
  }>> {
    try {
      const response = await fetchWithAuth(`${this.baseUrl}/session/${sessionId}/submit-answer`, {
        method: 'POST',
        body: JSON.stringify(request)
      });
      return response;
    } catch (error: any) {
      console.error('Error submitting answer:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to submit answer'
      };
    }
  }

  /**
   * Tạo câu hỏi follow-up
   */
  async generateFollowUpQuestion(sessionId: string, questionId: string, userAnswer: string): Promise<ApiResponse<{
    followUpQuestion: string;
  }>> {
    try {
      const response = await fetchWithAuth(`${this.baseUrl}/session/${sessionId}/follow-up-question`, {
        method: 'POST',
        body: JSON.stringify({ questionId, userAnswer })
      });
      return response;
    } catch (error: any) {
      console.error('Error generating follow-up question:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to generate follow-up question'
      };
    }
  }

  /**
   * Lấy câu trả lời mẫu
   */
  async getSampleAnswer(sessionId: string, questionId: string): Promise<ApiResponse<{
    sampleAnswer: string;
  }>> {
    try {
      const response = await fetchWithAuth(`${this.baseUrl}/session/${sessionId}/sample-answer/${questionId}`);
      return response;
    } catch (error: any) {
      console.error('Error getting sample answer:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get sample answer'
      };
    }
  }

  /**
   * Hoàn thành session
   */
  async completeSession(sessionId: string): Promise<ApiResponse<{
    overallFeedback: string;
    sessionCompleted: boolean;
  }>> {
    try {
      const response = await fetchWithAuth(`${this.baseUrl}/session/${sessionId}/complete`, {
        method: 'POST'
      });
      return response;
    } catch (error: any) {
      console.error('Error completing session:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to complete session'
      };
    }
  }

  /**
   * Lấy lịch sử phỏng vấn
   */
  async getInterviewHistory(): Promise<ApiResponse<{
    sessions: any[];
    totalSessions: number;
    averageScore: number;
  }>> {
    try {
      const response = await fetchWithAuth(`${this.baseUrl}/history`);
      return response;
    } catch (error: any) {
      console.error('Error getting interview history:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get interview history'
      };
    }
  }
}

export const aiInterviewApi = new AiInterviewApi();
