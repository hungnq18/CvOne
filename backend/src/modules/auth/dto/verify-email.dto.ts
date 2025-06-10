import { IsString, IsEmail, Length } from 'class-validator';

export class VerifyEmailDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6)
  code: string;
}

export class ResendVerificationDto {
  @IsEmail()
  email: string;
} 