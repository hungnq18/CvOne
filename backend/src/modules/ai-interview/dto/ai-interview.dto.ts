import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateInterviewSessionDto {
  @IsString()
  jobDescription: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  numberOfQuestions?: number;

  // Difficulty sẽ được tự động xác định từ jobDescription
}

export class SubmitAnswerDto {
  @IsString()
  questionId: string;

  @IsString()
  answer: string;
}

export class GenerateFollowUpDto {
  @IsString()
  questionId: string;

  @IsString()
  userAnswer: string;
}

export class UpdateSessionStatusDto {
  @IsEnum(['in-progress', 'completed', 'abandoned'])
  status: 'in-progress' | 'completed' | 'abandoned';
}

export class InterviewSessionResponse {
  sessionId: string;
  jobDescription: string;
  jobTitle?: string;
  companyName?: string;
  questions: any[];
  currentQuestionIndex: number;
  totalQuestions: number;
  completedQuestions: number;
  status: string;
  difficulty: string;
  language?: string;
  createdAt: Date;
}

export class InterviewFeedbackResponse {
  questionId: string;
  userAnswer: string;
  score: number;
  feedback: string;
  suggestions: string[];
  strengths: string[];
  improvements: string[];
}

export class CompleteSessionResponse {
  sessionId: string;
  overallFeedback: string;
  averageScore: number;
  totalQuestions: number;
  answeredQuestions: number;
  feedbacks: InterviewFeedbackResponse[];
  completedAt: Date;
}

