import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from "class-validator";

// DTO cho đăng ký HR: bao gồm thông tin Account + thông tin User + field HR bắt buộc
export class CreateAiUsageLogDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  feature: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  tokensUsed: number;
}
