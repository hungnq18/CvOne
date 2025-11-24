import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type FormFeedbackDocument = FormFeedback & Document;

export enum FeedbackFeature {
  TRANSLATE_CV = "translate_cv", // Dịch CV với AI
  GENERATE_CV = "generate_cv", // Tạo CV với AI
  REBUILD_CV_FROM_PDF = "rebuild_cv_pdf", // AI tạo lại CV từ PDF theo JD
  AI_INTERVIEW = "ai_interview", // Phỏng vấn với AI dựa trên JD
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
