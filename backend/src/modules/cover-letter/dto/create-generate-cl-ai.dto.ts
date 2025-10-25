import { IsArray, IsString } from "class-validator";

export class CreateGenerateCoverLetterDto {
  @IsString()
  templateId: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  profession: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  phone: string;

  @IsString()
  email: string;

  date: Date;

  @IsString()
  recipientFirstName: string;

  @IsString()
  recipientLastName: string;

  @IsString()
  recipientCity: string;

  @IsString()
  recipientState: string;

  @IsString()
  recipientPhone: string;

  @IsString()
  recipientEmail: string;

  @IsArray()
  @IsString({ each: true })
  strengths: string[];

  @IsString()
  workStyle: string;
}
