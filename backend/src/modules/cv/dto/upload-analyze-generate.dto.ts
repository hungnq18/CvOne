import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UploadAnalyzeGenerateDto {
  @IsNotEmpty()
  @IsString()
  jobDescription: string;

  @IsOptional()
  @IsString()
  additionalNotes?: string;
}
