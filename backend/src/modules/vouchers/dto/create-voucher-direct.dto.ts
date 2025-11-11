import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsArray,
  IsBoolean,
  IsOptional,
  IsNumber,
} from "class-validator";

export class CreateVoucherDirectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsNumber()
  @IsNotEmpty()
  discountValue: number;

  @IsString()
  @IsNotEmpty()
  discountType: string;

  @IsNumber()
  @IsNotEmpty()
  maxDiscountValue: number;

  @IsNumber()
  @IsNotEmpty()
  minOrderValue: number;

  @IsNumber()
  @IsNotEmpty()
  usageLimit: number;

  @IsNumber()
  @IsOptional()
  perUserLimit: number;

  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @IsDateString()
  @IsNotEmpty()
  endDate: Date;
}
