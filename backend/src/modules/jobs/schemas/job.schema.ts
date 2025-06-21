import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type JobDocument = Job & Document;

@Schema({ timestamps: true })
export class Job {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  role: string;

  @Prop({ required: true })
  workType: string;
  @Prop({ required: true })
  postingDate: Date;

  @Prop({ required: true })
  experience: string;

  @Prop({ required: true })
  qualifications: string;

  @Prop({ required: true })
  salaryRange: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  benefits: Array<string>;

  @Prop({ required: true })
  skills: string;

  @Prop({ required: true })
  responsibilities: string;

  @Prop()
  user_id: Types.ObjectId;
}

export const JobSchema = SchemaFactory.createForClass(Job);
