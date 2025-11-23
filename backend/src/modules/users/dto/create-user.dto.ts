import { IsMongoId, IsNotEmpty, IsString, Matches } from "class-validator";
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
  @Matches(/^\+?[0-9]{10,15}$/, {
    message: "Phone number is not valid",
  })
  phone?: string;

  @IsString()
  city?: string;

  @IsString()
  country?: string;
}
