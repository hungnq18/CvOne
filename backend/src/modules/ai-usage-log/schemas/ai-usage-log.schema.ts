import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type AiUsageLogDocument = AiUsageLog & Document;

export enum AiFeature {
  TRANS_AI = "transAI",
  INTERVIEW_AI = "interviewAI",
  CV_AI = "cvAI",
  COVER_LETTER_AI = "coverLetterAI",
  SUGGESTION_AI = "suggestionAI",
  ANALYZE_JD = "analyzeJD",
}

@Schema({ timestamps: true })
export class AiUsageLog {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: AiFeature, required: true, unique: true })
  feature: AiFeature;

  @Prop({ required: true })
  tokensUsed: number;
}

export const AiUsageLogSchema = SchemaFactory.createForClass(AiUsageLog);
