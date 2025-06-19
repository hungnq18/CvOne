// create-cl-template.dto.ts
import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  IsObject,
  IsOptional,
} from "class-validator";

export class CreateClTemplateDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsBoolean()
  @IsOptional()
  isRecommended?: boolean;

  @IsObject()
  @IsNotEmpty()
  data: Record<string, any>;
}
