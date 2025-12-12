import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { RevenueStatus, RevenueType } from '../schemas/revenue.schema';

export class UpdateRevenueDto {
  @IsEnum(RevenueType)
  @IsOptional()
  revenueType?: RevenueType;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsEnum(RevenueStatus)
  @IsOptional()
  status?: RevenueStatus;

  @IsString()
  @IsOptional()
  description?: string;

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
  @IsOptional()
  revenueDate?: string;
}

