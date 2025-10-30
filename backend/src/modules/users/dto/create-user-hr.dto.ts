import { CreateUserDto } from "./create-user.dto";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateHRDto extends CreateUserDto {
    @IsString()
    @IsNotEmpty()
    company_name: string;

    @IsString()
    @IsNotEmpty()
    company_country: string;

    @IsString()
    @IsNotEmpty()
    company_city: string;

    @IsString()
    @IsNotEmpty()
    company_district: string;

    @IsString()
    @IsNotEmpty()
    vatRegistrationNumber: string;
}
