import { IsNotEmpty, IsOptional, IsString, IsBoolean } from "class-validator";

export class CreateCategoryCvDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
