import { IsMongoId, IsNotEmpty, IsObject, IsString } from "class-validator";
import { Types } from "mongoose";

export class CreateCvDto {
  @IsMongoId()
  @IsNotEmpty()
  cvTemplateId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsObject()
  @IsNotEmpty()
  content: Record<string, any>;
}
