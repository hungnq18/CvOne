import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UseAiFeature } from 'src/common/decorators/ai-feature.decorator';
import { AiTokenGuard } from 'src/common/guards/ai-token.guard';
import { AiUsageInterceptor } from 'src/common/interceptors/ai-usage.interceptor';
import { User } from '../../common/decorators/user.decorator';
import { AiFeature } from '../ai-usage-log/schemas/ai-usage-log.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateInterviewSessionDto, InterviewSessionResponse, SubmitAnswerDto } from './dto/ai-interview.dto';
import { AiInterviewService } from './services/ai-interview.service';

@Controller('ai-interview')
export class AiInterviewController {
  constructor(
    private readonly aiInterviewService: AiInterviewService
  ) {}

  /**
   * Tạo buổi phỏng vấn mới với AI - độ khó tự động xác định từ JD
   */
  @UseGuards(JwtAuthGuard, AiTokenGuard)
  @UseAiFeature(AiFeature.INTERVIEW_AI)
  @UseInterceptors(AiUsageInterceptor)      
  @Post('create-session')
  async createInterviewSession(
    @Body() createInterviewDto: CreateInterviewSessionDto,
    @User('_id') userId: string
  ) {
    try {
      const { session, total_tokens } = await this.aiInterviewService.createInterviewSession(
        userId,
        createInterviewDto.jobDescription,
        createInterviewDto.numberOfQuestions || 10,
        createInterviewDto.jobTitle,
        createInterviewDto.companyName
      );

      const response: InterviewSessionResponse = {
        sessionId: String(session._id),
        jobDescription: session.jobDescription,
        jobTitle: session.jobTitle,
        companyName: session.companyName,
        questions: session.questions,
        currentQuestionIndex: session.currentQuestionIndex,
        totalQuestions: session.questions.length,
        completedQuestions: session.feedbacks.length,
        status: session.status,
        difficulty: session.difficulty,
        language: session.language || 'vi-VN',
        createdAt: session.createdAt,
        total_tokens,
      };

      return {
        success: true,
        data: response,
        total_tokens,
        message: `Interview session created successfully with ${session.difficulty} difficulty (auto-determined from JD)`
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
   * Lấy session theo ID
   */
  @UseGuards(JwtAuthGuard)
  @Get('session/:sessionId')
  async getSession(
    @Param('sessionId') sessionId: string,
    @User('_id') userId: string
  ) {
    try {
      const session = await this.aiInterviewService.getSessionById(sessionId, userId);
      
      return {
        success: true,
        data: {
          sessionId: String(session._id),
          jobDescription: session.jobDescription,
          jobTitle: session.jobTitle,
          companyName: session.companyName,
          questions: session.questions,
          currentQuestionIndex: session.currentQuestionIndex,
          totalQuestions: session.questions.length,
          completedQuestions: session.feedbacks.length,
          status: session.status,
          difficulty: session.difficulty,
          language: session.language || 'vi-VN',
          averageScore: session.averageScore,
          overallFeedback: session.overallFeedback,
          feedbacks: session.feedbacks,
          createdAt: session.createdAt,
          completedAt: session.completedAt
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
   * Lấy câu hỏi hiện tại trong session
   */
  @UseGuards(JwtAuthGuard)
  @Get('session/:sessionId/current-question')
  async getCurrentQuestion(
    @Param('sessionId') sessionId: string,
    @User('_id') userId: string
  ) {
    try {
      const session = await this.aiInterviewService.getSessionById(sessionId, userId);
      const currentQuestion = session.questions[session.currentQuestionIndex];
      
      if (!currentQuestion) {
        return {
          success: false,
          message: 'No more questions available'
        };
      }

      return {
        success: true,
        data: currentQuestion
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
  @UseGuards(JwtAuthGuard, AiTokenGuard)
  @UseAiFeature(AiFeature.INTERVIEW_AI)
  @UseInterceptors(AiUsageInterceptor)
  @Post('session/:sessionId/submit-answer')
  async submitAnswer(
    @Param('sessionId') sessionId: string,
    @Body() submitAnswerDto: SubmitAnswerDto,
    @User('_id') userId: string
  ) {
    try {
      const feedback = await this.aiInterviewService.submitAnswer(
        sessionId,
        userId,
        submitAnswerDto.questionId,
        submitAnswerDto.answer
      );

      // Lấy session để check xem còn câu hỏi nào không
      const session = await this.aiInterviewService.getSessionById(sessionId, userId);
      const nextQuestionAvailable = session.currentQuestionIndex < session.questions.length - 1;

      return {
        success: true,
        data: {
          feedback,
          nextQuestionAvailable,
          totalQuestions: session.questions.length,
          answeredQuestions: session.feedbacks.length
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
      const session = await this.aiInterviewService.getSessionById(sessionId, userId);
      const question = session.questions.find(q => q.id === body.questionId);
      
      if (!question) {
        return {
          success: false,
          message: 'Question not found'
        };
      }

      const language = session.language || 'vi-VN';
      const followUpQuestion = await this.aiInterviewService.generateFollowUpQuestion(
        question as any,
        body.userAnswer,
        session.jobDescription,
        language
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
  @UseGuards(JwtAuthGuard, AiTokenGuard)
  @UseAiFeature(AiFeature.INTERVIEW_AI)
  @UseInterceptors(AiUsageInterceptor)
  @Get('session/:sessionId/sample-answer/:questionId')
  async getSampleAnswer(
    @Param('sessionId') sessionId: string,
    @Param('questionId') questionId: string,
    @User('_id') userId: string
  ) {
    try {
      const session = await this.aiInterviewService.getSessionById(sessionId, userId);
      const question = session.questions.find(q => q.id === questionId);
      
      if (!question) {
        return {
          success: false,
          message: 'Question not found'
        };
      }

      const language = session.language || 'vi-VN';
      const sampleAnswer = await this.aiInterviewService.generateSampleAnswer(
        question as any,
        session.jobDescription,
        language
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
  @UseGuards(JwtAuthGuard, AiTokenGuard)
  @UseAiFeature(AiFeature.INTERVIEW_AI)
  @UseInterceptors(AiUsageInterceptor)
  @Post('session/:sessionId/complete')
  async completeSession(
    @Param('sessionId') sessionId: string,
    @User('_id') userId: string
  ) {
    try {
      const session = await this.aiInterviewService.completeSession(sessionId, userId);

      return {
        success: true,
        data: {
          sessionId: String(session._id),
          overallFeedback: session.overallFeedback,
          averageScore: session.averageScore,
          totalQuestions: session.questions.length,
          answeredQuestions: session.feedbacks.length,
          feedbacks: session.feedbacks,
          completedAt: session.completedAt,
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
  async getInterviewHistory(
    @User('_id') userId: string,
    @Query('status') status?: 'in-progress' | 'completed' | 'abandoned'
  ) {
    try {
      const sessions = await this.aiInterviewService.getUserSessions(userId, status);
      const stats = await this.aiInterviewService.getUserStats(userId);

      return {
        success: true,
        data: {
          sessions: sessions.map(s => ({
            sessionId: String(s._id),
            jobDescription: s.jobDescription,
            jobTitle: s.jobTitle,
            companyName: s.companyName,
            difficulty: s.difficulty,
            status: s.status,
            totalQuestions: s.questions.length,
            answeredQuestions: s.feedbacks.length,
            averageScore: s.averageScore,
            createdAt: s.createdAt,
            completedAt: s.completedAt
          })),
          stats
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

  /**
   * Retake interview với cùng questions từ session cũ
   */
  @UseGuards(JwtAuthGuard, AiTokenGuard)
  @UseAiFeature(AiFeature.INTERVIEW_AI)
  @UseInterceptors(AiUsageInterceptor)
  @Post('retake-session/:sessionId')
  async retakeInterviewSession(
    @Param('sessionId') sessionId: string,
    @User('_id') userId: string
  ) {
    try {
      const session = await this.aiInterviewService.retakeInterviewSession(
        userId,
        sessionId
      );

      const response: InterviewSessionResponse = {
        sessionId: String(session._id),
        jobDescription: session.jobDescription,
        jobTitle: session.jobTitle,
        companyName: session.companyName,
        questions: session.questions,
        currentQuestionIndex: session.currentQuestionIndex,
        totalQuestions: session.questions.length,
        completedQuestions: session.feedbacks.length,
        status: session.status,
        difficulty: session.difficulty,
        language: session.language || 'vi-VN',
        createdAt: session.createdAt,
        total_tokens: session.questions.length,
      };

      return {
        success: true,
        data: response,
        message: 'Interview session retaken successfully with same questions'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retake interview session'
      };
    }
  }

  /**
   * Pre-generate questions cho job description (admin/batch job)
   * Tạo trước để không tốn token khi user thực hiện interview
   */
  @UseGuards(JwtAuthGuard)
  @Post('pre-generate-questions')
  async preGenerateQuestions(
    @Body() body: {
      jobDescription: string;
      numberOfQuestions?: number;
      jobTitle?: string;
      companyName?: string;
      difficulty?: 'easy' | 'medium' | 'hard';
    }
  ) {
    try {
      const pool = await this.aiInterviewService.preGenerateQuestions(
        body.jobDescription,
        body.numberOfQuestions || 10,
        body.jobTitle,
        body.companyName,
        body.difficulty
      );

      return {
        success: true,
        data: {
          poolId: String(pool._id),
          jobDescription: pool.jobDescription,
          difficulty: pool.difficulty,
          questionsCount: pool.questions.length,
          createdAt: pool.createdAt
        },
        message: `Pre-generated ${pool.questions.length} questions successfully`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to pre-generate questions'
      };
    }
  }

  /**
   * Google Cloud Text-to-Speech endpoint
   * Requires server-side Google credentials (GOOGLE_APPLICATION_CREDENTIALS or default ADC).
   */
  @UseGuards(JwtAuthGuard)
  @Post('tts/google')
  async synthesizeTts(
    @Body() body: {
      text: string;
      language?: string;
      voice?: string;
      speakingRate?: number;
      pitch?: number;
      audioEncoding?: 'MP3' | 'OGG_OPUS' | 'LINEAR16';
    }
  ) {
    try {
      const audioContent = await this.aiInterviewService.synthesizeSpeech({
        text: body.text,
        language: body.language || 'vi-VN',
        voice: body.voice || 'vi-VN-Wavenet-A',
        speakingRate: body.speakingRate ?? 0.95,
        pitch: body.pitch ?? 0,
        audioEncoding: body.audioEncoding || 'MP3',
      });

      return {
        success: true,
        data: { audioContent },
        message: 'TTS generated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to generate TTS',
      };
    }
  }
}
