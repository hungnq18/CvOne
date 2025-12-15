import { SetMetadata } from "@nestjs/common";
import { AiFeature } from "../../modules/ai-usage-log/schemas/ai-usage-log.schema";

export const AI_FEATURE_KEY = "AI_FEATURE";

export const UseAiFeature = (feature: AiFeature) =>
  SetMetadata(AI_FEATURE_KEY, feature);
