import { IsEnum, IsOptional } from "class-validator";
import { AiFeature } from "../schemas/ai-averege.schemas";

export class ResetAverageDto {
  @IsOptional()
  @IsEnum(AiFeature)
  feature?: AiFeature;
}
