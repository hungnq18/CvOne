import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { RevenueStatus, RevenueType } from '../schemas/revenue.schema';

export class CreateRevenueDto {
  @IsOptional()
  orderId?: string;

  @IsEnum(RevenueType)
  revenueType: RevenueType;

  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsEnum(RevenueStatus)
  @IsOptional()
  status?: RevenueStatus;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  transactionId?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  revenueDate: string;
}

