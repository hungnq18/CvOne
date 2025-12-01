import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from "class-validator";

// DTO cho đăng ký HR: bao gồm thông tin Account + thông tin User + field HR bắt buộc
export class CreateAccountHRDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  last_name: string;

  @IsOptional()
  @Transform(({ value }) => value || undefined)
  @Matches(/^\+?[0-9]{10,15}$/, {
    message: "Phone number is not valid",
  })
  @ApiProperty()
  phone?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value || undefined)
  @ApiProperty()
  country?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value || undefined)
  @ApiProperty()
  city?: string;

  // Các trường bắt buộc cho HR
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  company_name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  company_country: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  company_city: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  company_district: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  vatRegistrationNumber: string;
}
