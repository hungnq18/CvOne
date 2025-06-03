import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
export class CreateAccountDto {
@IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty()
  password: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value || undefined)
  @ApiProperty()
  phone?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value || undefined)
  @ApiProperty()
  address?: string;
} 