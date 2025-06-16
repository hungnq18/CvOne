import { IsString, IsNotEmpty, IsDateString, IsArray } from "class-validator";

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsString()
  @IsNotEmpty()
  workType: string;

  @IsDateString()
  @IsNotEmpty()
  postingDate: string;

  @IsString()
  @IsNotEmpty()
  experience: string;

  @IsString()
  @IsNotEmpty()
  qualifications: string;

  @IsString()
  @IsNotEmpty()
  salaryRange: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  benefits: string[];

  @IsString()
  @IsNotEmpty()
  skills: string;

  @IsString()
  @IsNotEmpty()
  responsibilities: string;
}
