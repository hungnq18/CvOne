import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * Schema for individual interview questions
 */
@Schema({ _id: false })
export class InterviewQuestionSchema {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  question: string;

  @Prop({ required: true })
  category: string; // technical, behavioral, situational, company

  @Prop({ 
    required: true, 
    enum: ['easy', 'medium', 'hard'],
    default: 'medium' 
  })
  difficulty: 'easy' | 'medium' | 'hard';

  @Prop({ type: [String], default: [] })
  tips: string[];

  @Prop()
  expectedAnswer?: string;
}

const InterviewQuestionSchemaFactory = SchemaFactory.createForClass(InterviewQuestionSchema);

/**
 * Schema for interview feedback on each question
 */
@Schema({ _id: false })
export class InterviewFeedbackSchema {
  @Prop({ required: true })
  questionId: string;

  @Prop({ required: true })
  userAnswer: string;

  @Prop({ required: true, min: 1, max: 10 })
  score: number;

  @Prop({ required: true })
  feedback: string;

  @Prop({ type: [String], default: [] })
  suggestions: string[];

  @Prop({ type: [String], default: [] })
  strengths: string[];

  @Prop({ type: [String], default: [] })
  improvements: string[];

  @Prop({ default: Date.now })
  evaluatedAt: Date;
}

const InterviewFeedbackSchemaFactory = SchemaFactory.createForClass(InterviewFeedbackSchema);

/**
 * Main schema for AI Interview Session
 */
@Schema({ timestamps: true })
export class AiInterviewSession extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  jobDescription: string;

  @Prop()
  jobTitle?: string;

  @Prop()
  companyName?: string;

  @Prop({ type: [InterviewQuestionSchemaFactory], default: [] })
  questions: InterviewQuestionSchema[];

  @Prop({ default: 0 })
  currentQuestionIndex: number;

  @Prop({ 
    type: Map, 
    of: String, 
    default: {} 
  })
  userAnswers: Map<string, string>; // questionId -> answer

  @Prop({ 
    type: [InterviewFeedbackSchemaFactory], 
    default: [] 
  })
  feedbacks: InterviewFeedbackSchema[];

  @Prop({ 
    required: true, 
    enum: ['easy', 'medium', 'hard'],
    default: 'medium' 
  })
  difficulty: string;

  @Prop({ default: 10 })
  numberOfQuestions: number;

  @Prop({ 
    required: true,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress' 
  })
  status: string;

  @Prop()
  overallFeedback?: string;

  @Prop()
  averageScore?: number;

  @Prop()
  completedAt?: Date;

  @Prop({ default: 0 })
  totalTimeSpent?: number; // in seconds

  @Prop({ 
    default: 'vi-VN',
    enum: ['vi-VN', 'en-US', 'en-GB', 'ja-JP', 'ko-KR', 'zh-CN', 'fr-FR', 'de-DE', 'es-ES']
  })
  language?: string; // Language detected from job description

  // Metadata
  @Prop({ type: Object })
  metadata?: {
    followUpQuestions?: { [questionId: string]: string };
    sampleAnswers?: { [questionId: string]: string };
  };

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const AiInterviewSessionSchema = SchemaFactory.createForClass(AiInterviewSession);

// Indexes for better query performance
AiInterviewSessionSchema.index({ userId: 1, createdAt: -1 });
AiInterviewSessionSchema.index({ status: 1 });
AiInterviewSessionSchema.index({ userId: 1, status: 1 });

