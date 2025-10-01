import { IsMongoId, IsNotEmpty, IsString } from "class-validator";
import { Types } from "mongoose";

export class CreateUserDto {
  @IsMongoId()
  @IsNotEmpty()
  account_id: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsString()
  phone: number;

  @IsString()
  city: string;

  @IsString()
  country: string;
}
