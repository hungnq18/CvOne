import { Type } from 'class-transformer';
import {
    IsArray,
    IsDateString,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { CostStatus, CostType } from '../schemas/profit.schema';

export class CreateCostDto {
  @IsEnum(CostType)
  costType: CostType;

  @IsNumber()
  amount: number;

  @IsString()
  description: string;

  @IsEnum(CostStatus)
  @IsOptional()
  status?: CostStatus;

  @IsDateString()
  costDate: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateProfitDto {
  @IsString()
  period: string;

  @IsString()
  periodType: string;

  @IsString()
  revenueId: string;

  @IsNumber()
  totalRevenue: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCostDto)
  costs: CreateCostDto[];

  @IsString()
  currency: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

