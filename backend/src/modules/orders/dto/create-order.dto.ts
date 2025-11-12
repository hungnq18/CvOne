import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsArray,
  IsBoolean,
  IsOptional,
  IsNumber,
} from "class-validator";

export class CreateOrderDto {
  @IsString()
  @IsOptional()
  voucherId: string;

  @IsNumber()
  @IsNotEmpty()
  totalToken: number;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;
}
