import { IsBoolean, IsNotEmpty, IsObject, IsString } from "class-validator";

export class CreateGenerateCoverLetterDto {
  @IsString()
  @IsNotEmpty()
  templateId: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  profession: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  date: Date;

  @IsString()
  @IsNotEmpty()
  recipientFirstName: string;

  @IsString()
  @IsNotEmpty()
  recipientLastName: string;

  @IsString()
  @IsNotEmpty()
  recipientCity: string;

  @IsString()
  @IsNotEmpty()
  recipientState: string;

  @IsString()
  @IsNotEmpty()
  recipientPhone: string;

  @IsString()
  @IsNotEmpty()
  recipientEmail: string;

  @IsNotEmpty()
  strengths: Array<string>;

  @IsString()
  @IsNotEmpty()
  workStyle: string;

  @IsString()
  @IsNotEmpty()
  jobDescription: string;
}
