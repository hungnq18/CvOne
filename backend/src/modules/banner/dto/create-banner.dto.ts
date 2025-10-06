import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
} from "class-validator";

export class CreateBannerDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @IsString()
  redirectUrl?: string;
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsNotEmpty()
  @IsString()
  position: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;
}
