import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
export class CreateAccountDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  last_name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty()
  password: string;

  @IsOptional()
  @Transform(({ value }) => value || undefined)
  @ApiProperty()
  phone?: number;

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

  @IsString()
  @IsOptional()
  @ApiProperty()
  role?: string;
}
