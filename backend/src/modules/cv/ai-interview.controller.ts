import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';
import { User } from '../../common/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiInterviewService, InterviewFeedback, InterviewQuestion, InterviewSession } from './services/ai-interview.service';

export interface CreateInterviewDto {
  jobDescription: string;
  numberOfQuestions?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface SubmitAnswerDto {
  questionId: string;
  answer: string;
}

export interface InterviewSessionResponse {
  sessionId: string;
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  totalQuestions: number;
  completedQuestions: number;
}

@Controller('ai-interview')
export class AiInterviewController {
  constructor(
    private readonly aiInterviewService: AiInterviewService
  ) {}

  /**
   * Tạo buổi phỏng vấn mới với AI
   */
  @UseGuards(JwtAuthGuard)
  @Post('create-session')
  async createInterviewSession(
    @Body() createInterviewDto: CreateInterviewDto,
    @User('_id') userId: string
  ) {
    try {
      const questions = await this.aiInterviewService.generateInterviewQuestions(
        createInterviewDto.jobDescription,
        createInterviewDto.numberOfQuestions || 10,
        createInterviewDto.difficulty || 'medium'
      );

      const session: InterviewSession = {
        id: `session_${Date.now()}_${userId}`,
        jobDescription: createInterviewDto.jobDescription,
        questions,
        currentQuestionIndex: 0,
        userAnswers: {},
        feedback: {},
        createdAt: new Date()
      };

      // Trong thực tế, bạn nên lưu session vào database
      // Ở đây tôi sẽ trả về response trực tiếp
      const response: InterviewSessionResponse = {
        sessionId: session.id,
        questions: session.questions,
        currentQuestionIndex: session.currentQuestionIndex,
        totalQuestions: session.questions.length,
        completedQuestions: 0
      };

      return {
        success: true,
        data: response,
        message: 'Interview session created successfully'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to create interview session'
      };
    }
  }

  /**
   * Lấy câu hỏi hiện tại trong session
   */
  @UseGuards(JwtAuthGuard)
  @Get('session/:sessionId/current-question')
  async getCurrentQuestion(
    @Param('sessionId') sessionId: string,
    @User('_id') userId: string
  ) {
    try {
      // Trong thực tế, lấy session từ database
      // Ở đây tôi sẽ trả về mock data
      return {
        success: true,
        data: {
          questionId: 'q_1',
          question: 'Hãy giới thiệu về bản thân và kinh nghiệm của bạn',
          category: 'behavioral',
          difficulty: 'easy',
          tips: [
            'Tập trung vào kinh nghiệm liên quan đến công việc',
            'Nêu rõ thành tích và kỹ năng nổi bật',
            'Giữ thời gian trong 2-3 phút'
          ]
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Nộp câu trả lời và nhận feedback
   */
  @UseGuards(JwtAuthGuard)
  @Post('session/:sessionId/submit-answer')
  async submitAnswer(
    @Param('sessionId') sessionId: string,
    @Body() submitAnswerDto: SubmitAnswerDto,
    @User('_id') userId: string
  ) {
    try {
      // Trong thực tế, lấy session và question từ database
      const mockQuestion: InterviewQuestion = {
        id: submitAnswerDto.questionId,
        question: 'Hãy giới thiệu về bản thân và kinh nghiệm của bạn',
        category: 'behavioral',
        difficulty: 'easy',
        tips: []
      };

      const mockJobDescription = 'Software Developer position...';

      const feedback = await this.aiInterviewService.evaluateAnswer(
        mockQuestion,
        submitAnswerDto.answer,
        mockJobDescription
      );

      return {
        success: true,
        data: {
          feedback,
          nextQuestionAvailable: true
        },
        message: 'Answer submitted and evaluated successfully'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to submit answer'
      };
    }
  }

  /**
   * Tạo câu hỏi follow-up
   */
  @UseGuards(JwtAuthGuard)
  @Post('session/:sessionId/follow-up-question')
  async generateFollowUpQuestion(
    @Param('sessionId') sessionId: string,
    @Body() body: { questionId: string; userAnswer: string },
    @User('_id') userId: string
  ) {
    try {
      // Trong thực tế, lấy session và question từ database
      const mockQuestion: InterviewQuestion = {
        id: body.questionId,
        question: 'Hãy giới thiệu về bản thân và kinh nghiệm của bạn',
        category: 'behavioral',
        difficulty: 'easy',
        tips: []
      };

      const mockJobDescription = 'Software Developer position...';

      const followUpQuestion = await this.aiInterviewService.generateFollowUpQuestion(
        mockQuestion,
        body.userAnswer,
        mockJobDescription
      );

      return {
        success: true,
        data: {
          followUpQuestion
        },
        message: 'Follow-up question generated successfully'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to generate follow-up question'
      };
    }
  }

  /**
   * Lấy câu trả lời mẫu cho câu hỏi
   */
  @UseGuards(JwtAuthGuard)
  @Get('session/:sessionId/sample-answer/:questionId')
  async getSampleAnswer(
    @Param('sessionId') sessionId: string,
    @Param('questionId') questionId: string,
    @User('_id') userId: string
  ) {
    try {
      // Trong thực tế, lấy question từ database
      const mockQuestion: InterviewQuestion = {
        id: questionId,
        question: 'Hãy giới thiệu về bản thân và kinh nghiệm của bạn',
        category: 'behavioral',
        difficulty: 'easy',
        tips: []
      };

      const mockJobDescription = 'Software Developer position...';

      const sampleAnswer = await this.aiInterviewService.generateSampleAnswer(
        mockQuestion,
        mockJobDescription
      );

      return {
        success: true,
        data: {
          sampleAnswer
        },
        message: 'Sample answer generated successfully'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to generate sample answer'
      };
    }
  }

  /**
   * Hoàn thành session và nhận feedback tổng quan
   */
  @UseGuards(JwtAuthGuard)
  @Post('session/:sessionId/complete')
  async completeSession(
    @Param('sessionId') sessionId: string,
    @User('_id') userId: string
  ) {
    try {
      // Trong thực tế, lấy session và tất cả feedback từ database
      const mockSession: InterviewSession = {
        id: sessionId,
        jobDescription: 'Software Developer position...',
        questions: [],
        currentQuestionIndex: 0,
        userAnswers: {},
        feedback: {},
        createdAt: new Date(),
        completedAt: new Date()
      };

      const mockFeedbacks: InterviewFeedback[] = [];

      const overallFeedback = await this.aiInterviewService.generateOverallFeedback(
        mockSession,
        mockFeedbacks
      );

      return {
        success: true,
        data: {
          overallFeedback,
          sessionCompleted: true
        },
        message: 'Session completed successfully'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to complete session'
      };
    }
  }

  /**
   * Lấy lịch sử phỏng vấn của user
   */
  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getInterviewHistory(@User('_id') userId: string) {
    try {
      // Trong thực tế, lấy từ database
      return {
        success: true,
        data: {
          sessions: [],
          totalSessions: 0,
          averageScore: 0
        },
        message: 'Interview history retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve interview history'
      };
    }
  }
}
