import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type AiAverageStatsDocument = AiAverageStats & Document;

export enum AiFeature {
  TRANS_AI = "transAI",
  INTERVIEW_AI = "interviewAI",
  CV_AI = "cvAI",
}

@Schema({ timestamps: true })
export class AiAverageStats {
  @Prop({ type: String, enum: AiFeature, required: true, unique: true })
  feature: AiFeature; // mỗi feature một document

  @Prop({ type: Number, default: 0 })
  totalTokensUsed: number; // tổng token dùng

  @Prop({ type: Number, default: 0 })
  usageCount: number; // số lượt dùng
}

export const AiAverageStatsSchema =
  SchemaFactory.createForClass(AiAverageStats);
