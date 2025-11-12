import { IsString, IsNotEmpty } from "class-validator";

export class UpdateStatusOrderDto {
  @IsString()
  @IsNotEmpty()
  status: string;
}
