import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsArray,
  IsBoolean,
  IsOptional,
  IsNumber,
} from "class-validator";

export class UpdateVoucherDirectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

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
