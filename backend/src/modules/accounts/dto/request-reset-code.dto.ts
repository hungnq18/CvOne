import { IsEmail, IsNotEmpty } from "class-validator";

export class RequestResetCodeDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
}


