import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { RevenueStatus, RevenueType } from '../schemas/revenue.schema';

export class FilterRevenueDto {
  @IsEnum(RevenueType)
  @IsOptional()
  revenueType?: RevenueType;

  @IsEnum(RevenueStatus)
  @IsOptional()
  status?: RevenueStatus;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}

