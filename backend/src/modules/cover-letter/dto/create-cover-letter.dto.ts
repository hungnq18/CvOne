import { IsBoolean, IsNotEmpty, IsObject, IsString } from "class-validator";

export class CreateCoverLetterDto {
  @IsString()
  @IsNotEmpty()
  templateId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsObject()
  @IsNotEmpty()
  data: Record<string, any>;
}
