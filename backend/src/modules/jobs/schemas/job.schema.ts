import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type JobDocument = Job & Document;

@Schema({ timestamps: true })
export class Job {
  _id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    required: true,
    enum: ['draft', 'published', 'closed'],
    default: 'draft',
  })
  status: string;

  @Prop({ required: true })
  requirement: string;

  @Prop({ required: true })
  income: string;

  @Prop({ required: true })
  location: string;

  @Prop({ type: [String] })
  benefits: string[];

  @Prop({ type: Types.ObjectId, required: true, ref: 'Company' })
  company_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Category' })
  category_id: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const JobSchema = SchemaFactory.createForClass(Job);
