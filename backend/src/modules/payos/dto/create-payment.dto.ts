import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreatePaymentDto {
  @IsNumber()
  @IsNotEmpty()
  orderId: number;

  @IsNumber()
  amount: number;

  @IsString()
  description: string;
}
