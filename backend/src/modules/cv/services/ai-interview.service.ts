import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto';
import { Model, Types } from 'mongoose';
import { AiInterviewSession } from '../schemas/ai-interview.schema';
import { InterviewQuestionPool } from '../schemas/interview-question-pool.schema';
import { JobAnalysisService } from './job-analysis.service';
import { OpenaiApiService } from './openai-api.service';

export interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  expectedAnswer?: string;
  tips?: string[];
}

export interface InterviewFeedback {
  questionId: string;
  userAnswer: string;
  score: number; // 1-10
  feedback: string;
  suggestions: string[];
  strengths: string[];
  improvements: string[];
}

@Injectable()
export class AiInterviewService {
  private readonly logger = new Logger(AiInterviewService.name);

  constructor(
    @InjectModel(AiInterviewSession.name)
    private aiInterviewSessionModel: Model<AiInterviewSession>,
    @InjectModel(InterviewQuestionPool.name)
    private interviewQuestionPoolModel: Model<InterviewQuestionPool>,
    private readonly openaiApiService: OpenaiApiService,
    private readonly jobAnalysisService: JobAnalysisService
  ) {}

  /**
   * Helper method to parse JSON response from OpenAI
   */
  private parseJsonResponse(response: string): any {
    let cleanResponse = response.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return JSON.parse(cleanResponse);
  }

  /**
   * Generate hash from job description for pool lookup (without difficulty)
   */
  private generateJobDescriptionHash(jobDescription: string): string {
    const normalized = jobDescription.toLowerCase().trim().replace(/\s+/g, ' ');
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  /**
   * Generate hash with difficulty for pool lookup
   */
  private generatePoolHash(jobDescription: string, difficulty: 'easy' | 'medium' | 'hard'): string {
    const baseHash = this.generateJobDescriptionHash(jobDescription);
    return crypto.createHash('sha256').update(`${baseHash}_${difficulty}`).digest('hex');
  }

  /**
   * Check pool for existing questions (check all difficulty levels)
   * Returns pool and difficulty if found, null otherwise
   */
  async findExistingPool(
    jobDescription: string,
    numberOfQuestions: number
  ): Promise<{ pool: InterviewQuestionPool; difficulty: 'easy' | 'medium' | 'hard' } | null> {
    // Try to find existing pool with any difficulty level
    const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
    
    for (const difficulty of difficulties) {
      const hash = this.generatePoolHash(jobDescription, difficulty);
      const pool = await this.interviewQuestionPoolModel.findOne({ 
        jobDescriptionHash: hash,
        difficulty 
      });

      if (pool && pool.questions.length >= numberOfQuestions) {
        this.logger.log(`Found existing pool with ${pool.questions.length} questions (difficulty: ${difficulty})`);
        return { pool, difficulty };
      }
    }

    return null;
  }

  /**
   * Get questions from pool or generate new ones and save to pool
   * Tối ưu: Check pool trước, chỉ determine difficulty khi không có pool
   */
  async getOrGenerateQuestions(
    jobDescription: string,
    numberOfQuestions: number,
    jobTitle?: string,
    companyName?: string
  ): Promise<{ questions: InterviewQuestion[]; difficulty: 'easy' | 'medium' | 'hard' }> {
    // Bước 1: Check pool trước (không tốn token)
    const existingPool = await this.findExistingPool(jobDescription, numberOfQuestions);
    
    if (existingPool) {
      // Có pool rồi - dùng luôn, không cần gọi AI
      const { pool, difficulty } = existingPool;
      
      // Update usage stats
      pool.usageCount += 1;
      pool.lastUsedAt = new Date();
      await pool.save();

      // Return requested number of questions
      const questions = pool.questions.slice(0, numberOfQuestions).map(q => ({
        id: q.id,
        question: q.question,
        category: q.category,
        difficulty: q.difficulty,
        tips: q.tips || [],
        expectedAnswer: q.expectedAnswer
      }));

      this.logger.log(`✅ Using cached questions from pool (difficulty: ${difficulty}, saved ${pool.usageCount} tokens)`);
      return { questions, difficulty };
    }

    // Bước 2: Không có pool - phải generate mới (tốn token)
    this.logger.log(`⚠️ No pool found, generating new questions (will cost tokens)`);
    
    // Determine difficulty (tốn token lần đầu)
    const difficulty = await this.determineDifficulty(jobDescription);
    
    // Double-check pool sau khi determine difficulty (có thể request khác đã tạo)
    const doubleCheckPool = await this.findExistingPool(jobDescription, numberOfQuestions);
    if (doubleCheckPool) {
      this.logger.log(`✅ Pool found after difficulty determination (race condition handled)`);
      const { pool, difficulty: foundDifficulty } = doubleCheckPool;
      pool.usageCount += 1;
      pool.lastUsedAt = new Date();
      await pool.save();
      
      const questions = pool.questions.slice(0, numberOfQuestions).map(q => ({
        id: q.id,
        question: q.question,
        category: q.category,
        difficulty: q.difficulty,
        tips: q.tips || [],
        expectedAnswer: q.expectedAnswer
      }));
      
      return { questions, difficulty: foundDifficulty };
    }
    
    // Generate questions (tốn token)
    const questions = await this.generateInterviewQuestions(
      jobDescription,
      numberOfQuestions,
      difficulty
    );

    // Save to pool với upsert để tránh duplicate key error (race condition)
    const hash = this.generatePoolHash(jobDescription, difficulty);
    
    try {
      // Sử dụng findOneAndUpdate với upsert để tránh duplicate key
      const pool = await this.interviewQuestionPoolModel.findOneAndUpdate(
        { jobDescriptionHash: hash, difficulty },
        {
          $setOnInsert: {
            jobDescriptionHash: hash,
            jobDescription,
            jobTitle,
            companyName,
            difficulty,
            questions: questions.map(q => ({
              id: q.id,
              question: q.question,
              category: q.category,
              difficulty: q.difficulty,
              tips: q.tips || [],
              expectedAnswer: q.expectedAnswer
            })),
            usageCount: 0,
            lastUsedAt: new Date()
          },
          $inc: { usageCount: 1 },
          $set: { lastUsedAt: new Date() }
        },
        { 
          upsert: true, 
          new: true,
          setDefaultsOnInsert: true
        }
      );

      this.logger.log(`💾 Saved ${questions.length} questions to pool (difficulty: ${difficulty})`);
      return { questions, difficulty };
    } catch (error) {
      // Nếu vẫn bị duplicate (race condition), load pool đã có
      if (error.code === 11000) {
        this.logger.warn(`Duplicate key detected, loading existing pool`);
        const existingPool = await this.interviewQuestionPoolModel.findOne({ 
          jobDescriptionHash: hash,
          difficulty 
        });
        
        if (existingPool) {
          existingPool.usageCount += 1;
          existingPool.lastUsedAt = new Date();
          await existingPool.save();
          
          const existingQuestions = existingPool.questions.slice(0, numberOfQuestions).map(q => ({
            id: q.id,
            question: q.question,
            category: q.category,
            difficulty: q.difficulty,
            tips: q.tips || [],
            expectedAnswer: q.expectedAnswer
          }));
          
          return { questions: existingQuestions, difficulty };
        }
      }
      throw error;
    }
  }

  /**
   * Tự động xác định độ khó của interview dựa trên job description
   */
  async determineDifficulty(jobDescription: string): Promise<'easy' | 'medium' | 'hard'> {
    try {
      const prompt = `
Phân tích job description sau và xác định độ khó phỏng vấn phù hợp:

Job Description:
${jobDescription}

Xác định độ khó dựa trên:
1. Yêu cầu kinh nghiệm:
   - 0-2 năm hoặc Intern/Junior → easy
   - 3-5 năm hoặc Mid/Senior → medium
   - 5+ năm hoặc Lead/Manager → hard

2. Độ phức tạp kỹ năng:
   - Kỹ năng cơ bản, công nghệ phổ biến → easy
   - Kỹ năng trung bình, nhiều công nghệ → medium
   - Kỹ năng cao cấp, kiến trúc, leadership → hard

3. Trách nhiệm:
   - Thực hiện task đơn giản → easy
   - Phát triển tính năng, làm việc nhóm → medium
   - Thiết kế hệ thống, quản lý team → hard

Trả về JSON với format:
{
  "difficulty": "easy" | "medium" | "hard",
  "reason": "Lý do ngắn gọn"
}
`;

      const openai = this.openaiApiService.getOpenAI();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
      });
      const response = completion.choices[0]?.message?.content || '';
      const analysis = this.parseJsonResponse(response);
      
      this.logger.log(`Determined difficulty: ${analysis.difficulty} - ${analysis.reason}`);
      return analysis.difficulty;

    } catch (error) {
      this.logger.error(`Error determining difficulty: ${error.message}`, error.stack);
      // Fallback to medium if AI fails
      return 'medium';
    }
  }

  /**
   * Tạo session phỏng vấn mới
   * Tối ưu: Check pool trước, chỉ gọi AI khi không có pool
   */
  async createInterviewSession(
    userId: string,
    jobDescription: string,
    numberOfQuestions: number = 10,
    jobTitle?: string,
    companyName?: string
  ): Promise<AiInterviewSession> {
    try {
      // Lấy câu hỏi từ pool hoặc generate mới (tự động check pool trước)
      const { questions, difficulty } = await this.getOrGenerateQuestions(
        jobDescription,
        numberOfQuestions,
        jobTitle,
        companyName
      );

      // Tạo session mới
      const session = new this.aiInterviewSessionModel({
        userId: new Types.ObjectId(userId),
        jobDescription,
        jobTitle,
        companyName,
        questions,
        numberOfQuestions,
        difficulty,
        status: 'in-progress',
        currentQuestionIndex: 0,
        userAnswers: new Map(),
        feedbacks: [],
      });

      await session.save();
      this.logger.log(`Created interview session ${session._id} for user ${userId} with difficulty: ${difficulty} (${questions.length} questions)`);
      
      return session;
    } catch (error) {
      this.logger.error(`Error creating interview session: ${error.message}`, error.stack);
      throw new Error('Failed to create interview session');
    }
  }

  /**
   * Pre-generate questions cho job description (dùng để tạo trước, không tốn token khi user dùng)
   * Có thể gọi từ admin panel hoặc batch job
   */
  async preGenerateQuestions(
    jobDescription: string,
    numberOfQuestions: number = 10,
    jobTitle?: string,
    companyName?: string,
    difficulty?: 'easy' | 'medium' | 'hard'
  ): Promise<InterviewQuestionPool> {
    try {
      // Check xem đã có pool chưa
      const existingPool = await this.findExistingPool(jobDescription, numberOfQuestions);
      if (existingPool) {
        this.logger.log(`Pool already exists for this job description`);
        return existingPool.pool;
      }

      // Determine difficulty nếu chưa có
      const finalDifficulty = difficulty || await this.determineDifficulty(jobDescription);
      
      // Generate questions
      const questions = await this.generateInterviewQuestions(
        jobDescription,
        numberOfQuestions,
        finalDifficulty
      );

      // Save to pool với upsert để tránh duplicate key error
      const hash = this.generatePoolHash(jobDescription, finalDifficulty);

      const pool = await this.interviewQuestionPoolModel.findOneAndUpdate(
        { jobDescriptionHash: hash, difficulty: finalDifficulty },
        {
          $setOnInsert: {
            jobDescriptionHash: hash,
            jobDescription,
            jobTitle,
            companyName,
            difficulty: finalDifficulty,
            questions: questions.map(q => ({
              id: q.id,
              question: q.question,
              category: q.category,
              difficulty: q.difficulty,
              tips: q.tips || [],
              expectedAnswer: q.expectedAnswer
            })),
            usageCount: 0,
            lastUsedAt: undefined
          }
        },
        { 
          upsert: true, 
          new: true,
          setDefaultsOnInsert: true
        }
      );

      this.logger.log(`Pre-generated ${questions.length} questions for pool (difficulty: ${finalDifficulty})`);
      return pool;
    } catch (error) {
      this.logger.error(`Error pre-generating questions: ${error.message}`, error.stack);
      throw new Error('Failed to pre-generate questions');
    }
  }

  /**
   * Tạo câu hỏi phỏng vấn dựa trên job description
   */
  async generateInterviewQuestions(
    jobDescription: string,
    numberOfQuestions: number = 10,
    difficulty: 'easy' | 'medium' | 'hard'
  ): Promise<InterviewQuestion[]> {
    try {
      // Phân tích job description để hiểu yêu cầu
      const jobAnalysis = await this.jobAnalysisService.analyzeJobDescription(jobDescription);
      
      const prompt = `
Dựa trên job description sau, tạo ${numberOfQuestions} câu hỏi phỏng vấn phù hợp với mức độ ${difficulty}.

Job Description:
${jobDescription}

Phân tích job:
${JSON.stringify(jobAnalysis, null, 2)}

Yêu cầu:
1. Tạo câu hỏi đa dạng về: technical skills, behavioral, situational, company knowledge
2. Mức độ khó: ${difficulty}
3. Câu hỏi phải phù hợp với vị trí và yêu cầu công việc
4. Bao gồm cả câu hỏi mở và câu hỏi cụ thể
5. Mỗi câu hỏi cần có category và tips

Trả về JSON array với format:
[
  {
    "question": "Câu hỏi phỏng vấn",
    "category": "technical|behavioral|situational|company",
    "difficulty": "${difficulty}",
    "tips": ["tip1", "tip2"]
  }
]
`;

      const openai = this.openaiApiService.getOpenAI();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
      });
      const response = completion.choices[0]?.message?.content || '';
      
      // Parse JSON response
      const questionsData = this.parseJsonResponse(response);
      
      // Tạo InterviewQuestion objects
      const questions: InterviewQuestion[] = questionsData.map((q: any, index: number) => ({
        id: `q_${Date.now()}_${index}`,
        question: q.question,
        category: q.category,
        difficulty: q.difficulty,
        tips: q.tips || []
      }));

      this.logger.log(`Generated ${questions.length} interview questions with difficulty: ${difficulty}`);
      return questions;

    } catch (error) {
      this.logger.error(`Error generating interview questions: ${error.message}`, error.stack);
      throw new Error('Failed to generate interview questions');
    }
  }

  /**
   * Đánh giá câu trả lời của người dùng
   */
  async evaluateAnswer(
    question: InterviewQuestion,
    userAnswer: string,
    jobDescription: string
  ): Promise<InterviewFeedback> {
    try {
      const prompt = `
Đánh giá câu trả lời phỏng vấn của ứng viên:

Câu hỏi: ${question.question}
Câu trả lời của ứng viên: ${userAnswer}
Job Description: ${jobDescription}
Category: ${question.category}
Difficulty: ${question.difficulty}

Hãy đánh giá và trả về JSON với format:
{
  "score": 8, // điểm từ 1-10
  "feedback": "Đánh giá tổng quan về câu trả lời",
  "suggestions": ["Gợi ý cải thiện 1", "Gợi ý cải thiện 2"],
  "strengths": ["Điểm mạnh 1", "Điểm mạnh 2"],
  "improvements": ["Cần cải thiện 1", "Cần cải thiện 2"]
}

Tiêu chí đánh giá:
- Độ chính xác và phù hợp với câu hỏi
- Mức độ chi tiết và cụ thể
- Thể hiện kinh nghiệm và kỹ năng
- Cách trình bày logic và rõ ràng
- Phù hợp với yêu cầu công việc
`;

      const openai = this.openaiApiService.getOpenAI();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
      });
      const response = completion.choices[0]?.message?.content || '';
      const evaluation = this.parseJsonResponse(response);

      return {
        questionId: question.id,
        userAnswer,
        score: evaluation.score,
        feedback: evaluation.feedback,
        suggestions: evaluation.suggestions,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements
      };

    } catch (error) {
      this.logger.error(`Error evaluating answer: ${error.message}`, error.stack);
      throw new Error('Failed to evaluate answer');
    }
  }

  /**
   * Lấy session theo ID
   */
  async getSessionById(sessionId: string, userId: string): Promise<AiInterviewSession> {
    const session = await this.aiInterviewSessionModel.findOne({
      _id: sessionId,
      userId: new Types.ObjectId(userId)
    });

    if (!session) {
      throw new NotFoundException('Interview session not found');
    }

    return session;
  }

  /**
   * Submit câu trả lời và lưu feedback
   */
  async submitAnswer(
    sessionId: string,
    userId: string,
    questionId: string,
    answer: string
  ): Promise<InterviewFeedback> {
    const session = await this.getSessionById(sessionId, userId);
    
    // Tìm câu hỏi
    const question = session.questions.find(q => q.id === questionId);
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // Kiểm tra xem câu hỏi này đã được trả lời chưa
    const existingFeedback = session.feedbacks.find(f => f.questionId === questionId);
    if (existingFeedback) {
      this.logger.warn(`Question ${questionId} already answered, updating answer`);
      // Có thể cho phép update hoặc throw error, tùy business logic
    }

    // Đánh giá câu trả lời
    const feedback = await this.evaluateAnswer(question, answer, session.jobDescription);

    // Lưu vào session
    session.userAnswers.set(questionId, answer);
    
    // Nếu đã có feedback cho câu này, update; nếu chưa thì push mới
    if (existingFeedback) {
      const feedbackIndex = session.feedbacks.findIndex(f => f.questionId === questionId);
      session.feedbacks[feedbackIndex] = {
        questionId: feedback.questionId,
        userAnswer: feedback.userAnswer,
        score: feedback.score,
        feedback: feedback.feedback,
        suggestions: feedback.suggestions,
        strengths: feedback.strengths,
        improvements: feedback.improvements,
        evaluatedAt: new Date()
      } as any;
    } else {
      session.feedbacks.push({
        questionId: feedback.questionId,
        userAnswer: feedback.userAnswer,
        score: feedback.score,
        feedback: feedback.feedback,
        suggestions: feedback.suggestions,
        strengths: feedback.strengths,
        improvements: feedback.improvements,
        evaluatedAt: new Date()
      } as any);
    }

    // Cập nhật currentQuestionIndex để track tiến độ
    const currentQuestionIndex = session.questions.findIndex(q => q.id === questionId);
    if (currentQuestionIndex !== -1 && currentQuestionIndex >= session.currentQuestionIndex) {
      // Chỉ update nếu đang trả lời câu hỏi hiện tại hoặc câu tiếp theo
      session.currentQuestionIndex = currentQuestionIndex + 1;
    }

    await session.save();
    
    return feedback;
  }

  /**
   * Hoàn thành session
   */
  async completeSession(sessionId: string, userId: string): Promise<AiInterviewSession> {
    const session = await this.getSessionById(sessionId, userId);

    // Tính điểm trung bình
    const scores = session.feedbacks.map(f => f.score);
    const averageScore = scores.length > 0 
      ? scores.reduce((a, b) => a + b, 0) / scores.length 
      : 0;

    // Tạo overall feedback
    const overallFeedback = await this.generateOverallFeedback(session);

    // Cập nhật session
    session.status = 'completed';
    session.completedAt = new Date();
    session.averageScore = averageScore;
    session.overallFeedback = overallFeedback;

    await session.save();

    return session;
  }

  /**
   * Lấy tất cả sessions của user
   */
  async getUserSessions(
    userId: string,
    status?: 'in-progress' | 'completed' | 'abandoned'
  ): Promise<AiInterviewSession[]> {
    const query: any = { userId: new Types.ObjectId(userId) };
    if (status) {
      query.status = status;
    }

    return this.aiInterviewSessionModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Lấy thống kê interview của user
   */
  async getUserStats(userId: string) {
    const sessions = await this.getUserSessions(userId);
    const completedSessions = sessions.filter(s => s.status === 'completed');
    
    const totalSessions = sessions.length;
    const completedCount = completedSessions.length;
    const averageScore = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + (s.averageScore || 0), 0) / completedSessions.length
      : 0;

    return {
      totalSessions,
      completedSessions: completedCount,
      inProgressSessions: sessions.filter(s => s.status === 'in-progress').length,
      averageScore: Math.round(averageScore * 10) / 10,
      recentSessions: sessions.slice(0, 5)
    };
  }

  /**
   * Tạo feedback tổng quan cho toàn bộ buổi phỏng vấn
   */
  async generateOverallFeedback(session: AiInterviewSession): Promise<string> {
    try {
      const feedbackDetails = session.feedbacks.map(f => {
        const question = session.questions.find(q => q.id === f.questionId);
        return `
Câu hỏi: ${question?.question || 'N/A'}
Category: ${question?.category || 'N/A'}
Điểm: ${f.score}/10
Feedback: ${f.feedback}
Điểm mạnh: ${f.strengths.join(', ')}
Cần cải thiện: ${f.improvements.join(', ')}
`;
      }).join('\n---\n');

      const prompt = `
Tạo feedback tổng quan cho buổi phỏng vấn:

Job Description: ${session.jobDescription}
${session.jobTitle ? `Position: ${session.jobTitle}` : ''}
${session.companyName ? `Company: ${session.companyName}` : ''}
Difficulty Level: ${session.difficulty}
Số câu hỏi: ${session.questions.length}
Số câu đã trả lời: ${session.userAnswers.size}
Điểm trung bình: ${session.averageScore || 0}/10

Chi tiết feedback từng câu hỏi:
${feedbackDetails}

Hãy tạo feedback tổng quan chi tiết bao gồm:
1. Đánh giá tổng thể về hiệu suất phỏng vấn
2. Top 3 điểm mạnh nổi bật
3. Top 3 điểm cần cải thiện
4. Khuyến nghị cụ thể cho lần phỏng vấn thực tế
5. Lời khuyên về cách chuẩn bị tốt hơn
6. Đánh giá khả năng phù hợp với vị trí

Trả về feedback bằng tiếng Việt, chi tiết và mang tính xây dựng.
`;

      const openai = this.openaiApiService.getOpenAI();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
      });
      const response = completion.choices[0]?.message?.content || '';
      return response;

    } catch (error) {
      this.logger.error(`Error generating overall feedback: ${error.message}`, error.stack);
      throw new Error('Failed to generate overall feedback');
    }
  }

  /**
   * Tạo câu hỏi follow-up dựa trên câu trả lời
   */
  async generateFollowUpQuestion(
    originalQuestion: InterviewQuestion,
    userAnswer: string,
    jobDescription: string
  ): Promise<string> {
    try {
      const prompt = `
Dựa trên câu trả lời của ứng viên, tạo câu hỏi follow-up phù hợp:

Câu hỏi gốc: ${originalQuestion.question}
Câu trả lời: ${userAnswer}
Job Description: ${jobDescription}

Tạo 1 câu hỏi follow-up để:
- Làm sâu sắc thêm câu trả lời
- Kiểm tra hiểu biết chi tiết
- Đánh giá kinh nghiệm thực tế
- Phù hợp với category: ${originalQuestion.category}

Chỉ trả về câu hỏi, không cần giải thích.
`;

      const openai = this.openaiApiService.getOpenAI();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
      });
      const response = completion.choices[0]?.message?.content || '';
      return response.trim();

    } catch (error) {
      this.logger.error(`Error generating follow-up question: ${error.message}`, error.stack);
      throw new Error('Failed to generate follow-up question');
    }
  }

  /**
   * Tạo gợi ý câu trả lời mẫu
   */
  async generateSampleAnswer(
    question: InterviewQuestion,
    jobDescription: string
  ): Promise<string> {
    try {
      const prompt = `
Tạo câu trả lời mẫu cho câu hỏi phỏng vấn:

Câu hỏi: ${question.question}
Category: ${question.category}
Job Description: ${jobDescription}

Tạo câu trả lời mẫu:
- Chuyên nghiệp và phù hợp
- Thể hiện kinh nghiệm và kỹ năng
- Cấu trúc rõ ràng (STAR method nếu phù hợp)
- Phù hợp với yêu cầu công việc
- Độ dài vừa phải (2-3 đoạn văn)

Chỉ trả về câu trả lời mẫu, không cần giải thích.
`;

      const openai = this.openaiApiService.getOpenAI();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
      });
      const response = completion.choices[0]?.message?.content || '';
      return response.trim();

    } catch (error) {
      this.logger.error(`Error generating sample answer: ${error.message}`, error.stack);
      throw new Error('Failed to generate sample answer');
    }
  }
}
