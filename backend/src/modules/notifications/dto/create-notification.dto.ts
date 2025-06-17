import { IsNotEmpty, IsOptional, IsString, IsMongoId } from "class-validator";
import { Transform } from "class-transformer";
import { Types } from "mongoose";

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  link?: string;
}
