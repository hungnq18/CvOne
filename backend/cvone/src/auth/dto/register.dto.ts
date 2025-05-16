// src/auth/dto/register.dto.ts

import { IsEmail, IsNotEmpty, MinLength, Validate } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  confirmPassword: string;
}
