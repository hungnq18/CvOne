import { AiFeature } from "./schemas/ai-usage-log.schema";

/**
 * Metadata cho từng tính năng AI
 * - avgTokens: token trung bình 1 lần sử dụng
 * - description: mô tả (optional)
 */
export interface AiFeatureMetaConfig {
  avgTokens: number;
  description?: string;
}

export const AI_FEATURE_META: Record<AiFeature, AiFeatureMetaConfig> = {
  [AiFeature.TRANS_CV_AI]: {
    avgTokens: 800,
    description: "Dịch CV bằng AI",
  },

  [AiFeature.INTERVIEW_AI]: {
    avgTokens: 1200,
    description: "Phỏng vấn AI dựa trên JD",
  },

  [AiFeature.COVER_LETTER_AI]: {
    avgTokens: 500,
    description: "Tạo Cover Letter bằng AI",
  },

  [AiFeature.SUGGESTION_AI]: {
    avgTokens: 400,
    description: "Gợi ý nội dung chung bằng AI",
  },

  [AiFeature.ANALYZE_JD]: {
    avgTokens: 400,
    description: "Phân tích Job Description",
  },

  [AiFeature.SUGGESTION_SUMMARY_CV_AI]: {
    avgTokens: 300,
    description: "Gợi ý Summary cho CV",
  },

  [AiFeature.SUGGESTION_SKILLS_CV_AI]: {
    avgTokens: 500,
    description: "Gợi ý Skills cho CV",
  },

  [AiFeature.SUGGESTION_WORKS_EXPERIENCE_CV_AI]: {
    avgTokens: 500,
    description: "Gợi ý Work Experience cho CV",
  },

  [AiFeature.REWRITE_WORK_DESCRIPTION]: {
    avgTokens: 350,
    description: "Rewrite mô tả công việc",
  },

  [AiFeature.SUGGESTION_TEMPLATES_AI]: {
    avgTokens: 200,
    description: "Gợi ý Tags cho CV",
  },

  [AiFeature.UPLOAD_CV_AI]: {
    avgTokens: 200,
    description: "Upload CV bằng AI",
  },
};
