import { IsOptional, IsString } from "class-validator";

export class UploadCvDto {
  @IsOptional()
  @IsString()
  additionalNotes?: string;
}
