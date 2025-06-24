import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GenerateCvDto {
  @IsString()
  @IsNotEmpty()
  jobDescription: string;

  @IsString()
  @IsOptional()
  cvTemplateId?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  additionalRequirements?: string;
} 