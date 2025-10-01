import { IsEmail, IsNotEmpty } from "class-validator";

export class VerifyEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
