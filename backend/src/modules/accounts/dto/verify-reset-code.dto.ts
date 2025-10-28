import { IsEmail, IsNotEmpty, Length, MinLength } from "class-validator";

export class VerifyResetCodeDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @Length(6, 6)
    code: string;

    @IsNotEmpty()
    @MinLength(6)
    newPassword: string;
}
