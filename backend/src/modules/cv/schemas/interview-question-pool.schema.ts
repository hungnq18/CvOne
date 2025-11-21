import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Schema for individual interview questions in pool
 */
@Schema({ _id: false })
export class PoolQuestionSchema {
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

const PoolQuestionSchemaFactory = SchemaFactory.createForClass(PoolQuestionSchema);

/**
 * Schema for storing pre-generated interview questions
 * Questions are generated once and reused for similar job descriptions
 */
@Schema({ timestamps: true })
export class InterviewQuestionPool extends Document {
  @Prop({ required: true, unique: true })
  jobDescriptionHash: string; // Hash of job description for quick lookup

  @Prop({ required: true })
  jobDescription: string;

  @Prop()
  jobTitle?: string;

  @Prop()
  companyName?: string;

  @Prop({ 
    required: true, 
    enum: ['easy', 'medium', 'hard'],
    default: 'medium' 
  })
  difficulty: 'easy' | 'medium' | 'hard';

  @Prop({ type: [PoolQuestionSchemaFactory], required: true })
  questions: PoolQuestionSchema[];

  @Prop({ default: 0 })
  usageCount: number; // Track how many times this pool has been used

  @Prop()
  lastUsedAt?: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const InterviewQuestionPoolSchema = SchemaFactory.createForClass(InterviewQuestionPool);

// Indexes for better query performance
InterviewQuestionPoolSchema.index({ jobDescriptionHash: 1 });
InterviewQuestionPoolSchema.index({ difficulty: 1 });
InterviewQuestionPoolSchema.index({ lastUsedAt: -1 });

