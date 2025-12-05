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
  SUGGESTION_TAGS_CV_AI = "suggestionTagsCvAI",
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
