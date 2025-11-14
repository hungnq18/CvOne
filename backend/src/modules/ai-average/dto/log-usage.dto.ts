import { IsEnum, IsNumber, IsPositive } from "class-validator";
import { Type } from "class-transformer";
import { AiFeature } from "../schemas/ai-averege.schemas";

export class LogUsageDto {
  @IsEnum(AiFeature)
  feature: AiFeature;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  tokens: number;
}
