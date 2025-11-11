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
  @IsNotEmpty()
  userId: string;

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
  status: string;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;
}
