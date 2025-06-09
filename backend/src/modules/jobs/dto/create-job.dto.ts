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
  postingDate: Date;

  @IsString()
  experience: string;

  @IsString()
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
  @ArrayNotEmpty()
  @IsString({ each: true })
  benefits: string[];

  @IsString()
  skills: string;

  @IsString()
  responsibilities: string;

  //   @IsString()
  //   @Transform(({ value }) => (value ? new Types.ObjectId(value) : undefined))
  //   @IsNotEmpty()
  //   @ApiProperty({ description: "Company ID", example: "507f1f77bcf86cd799439011" })
  //   company_id: Types.ObjectId;

  @IsString()
  @Transform(({ value }) => (value ? new Types.ObjectId(value) : undefined))
  @IsNotEmpty()
  user_id: Types.ObjectId;
}
