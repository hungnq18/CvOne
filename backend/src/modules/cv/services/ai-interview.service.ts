import { Injectable, Logger } from '@nestjs/common';
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

export interface InterviewSession {
  id: string;
  jobDescription: string;
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  userAnswers: { [questionId: string]: string };
  feedback: { [questionId: string]: string };
  createdAt: Date;
  completedAt?: Date;
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
   * Tạo câu hỏi phỏng vấn dựa trên job description
   */
  async generateInterviewQuestions(
    jobDescription: string,
    numberOfQuestions: number = 10,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
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

      this.logger.log(`Generated ${questions.length} interview questions`);
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
   * Tạo feedback tổng quan cho toàn bộ buổi phỏng vấn
   */
  async generateOverallFeedback(
    session: InterviewSession,
    allFeedbacks: InterviewFeedback[]
  ): Promise<string> {
    try {
      const prompt = `
Tạo feedback tổng quan cho buổi phỏng vấn:

Job Description: ${session.jobDescription}
Số câu hỏi: ${session.questions.length}
Số câu đã trả lời: ${Object.keys(session.userAnswers).length}

Chi tiết feedback:
${allFeedbacks.map(f => `
Câu hỏi: ${session.questions.find(q => q.id === f.questionId)?.question}
Điểm: ${f.score}/10
Feedback: ${f.feedback}
`).join('\n')}

Hãy tạo feedback tổng quan bao gồm:
1. Đánh giá tổng thể
2. Điểm mạnh chính
3. Điểm cần cải thiện
4. Khuyến nghị cho lần phỏng vấn thực tế
5. Lời khuyên cụ thể
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
