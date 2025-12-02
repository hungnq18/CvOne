import { IsBoolean, IsNotEmpty } from "class-validator";
export class UpdateHrActiveDto {
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}
