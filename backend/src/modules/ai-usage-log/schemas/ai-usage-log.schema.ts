import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type AiUsageLogDocument = AiUsageLog & Document;

export enum AiFeature {
  TRANS_CV_AI = "transCvAI",
  INTERVIEW_AI = "interviewAI",
  COVER_LETTER_AI = "coverLetterAI",
  SUGGESTION_AI = "suggestionAI",
  ANALYZE_JD = "analyzeJD",
  SUGGESTION_SUMMARY_CV_AI = "suggestionSummaryCvAI",
  SUGGESTION_SKILLS_CV_AI = "suggestionSkillsCvAI",
  SUGGESTION_WORKS_EXPERIENCE_CV_AI = "suggestionWorksExperienceCvAI",
  REWRITE_WORK_DESCRIPTION = "rewriteWorkDescription",
  SUGGESTION_TEMPLATES_AI = "suggestionTemplatesAI",
  GENERATE_CV_AI = "generateCvAI",
  UPLOAD_CV_AI = "uploadCvAI",
}

@Schema({ timestamps: true })
export class AiUsageLog {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: AiFeature, required: true })
  feature: AiFeature;

  @Prop({ required: true })
  tokensUsed: number;
}

export const AiUsageLogSchema = SchemaFactory.createForClass(AiUsageLog);

// Remove unique index on feature field if it exists
// Add compound index for better query performance
AiUsageLogSchema.index({ userId: 1, feature: 1 });
