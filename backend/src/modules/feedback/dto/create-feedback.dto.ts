import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsArray,
} from "class-validator";
import { Type } from "class-transformer";
import { FeedbackFeature } from "../schemas/feedback.schema";

class FeedbackAnswerDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  answer: any;
}

export class CreateFormFeedbackDto {
  @IsEnum(FeedbackFeature)
  feature: FeedbackFeature;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeedbackAnswerDto)
  answers: FeedbackAnswerDto[];
  @IsOptional()
  submittedAt?: Date;
}
