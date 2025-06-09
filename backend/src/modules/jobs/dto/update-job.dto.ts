import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ArrayNotEmpty,
} from "class-validator";
import { Types } from "mongoose";

export class UpdateJobDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  workType?: string;

  @IsDateString()
  @IsOptional()
  postingDate?: Date;

  @IsString()
  @IsOptional()
  experience?: string;

  @IsString()
  @IsOptional()
  qualifications?: string;

  @IsString()
  @IsOptional()
  salaryRange?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsOptional()
  benefits?: string[];

  @IsString()
  @IsOptional()
  skills?: string;

  @IsString()
  @IsOptional()
  responsibilities?: string;
}
