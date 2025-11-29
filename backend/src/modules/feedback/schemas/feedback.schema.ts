import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type FormFeedbackDocument = FormFeedback & Document;

export enum FeedbackFeature {
  TRANSLATE_CV = "translate_cv",
  GENERATE_CL = "generate_cl",
  GENERATE_CV = "generate_cv",
  SUGGEST_JOB = "suggest_job",
  AI_INTERVIEW = "ai_interview",
}

@Schema({ timestamps: true })
export class FormFeedback {
  @Prop({ required: true, enum: FeedbackFeature })
  feature: FeedbackFeature;

  @Prop({
    type: [
      {
        title: { type: String, required: true },
        answer: { type: Object, required: true },
      },
    ],
    required: true,
  })
  answers: {
    title: string;
    answer: any;
  }[];
  // Mảng câu hỏi + câu trả lời từ Google Form

  @Prop()
  submittedAt?: Date;
}

export const FormFeedbackSchema = SchemaFactory.createForClass(FormFeedback);
