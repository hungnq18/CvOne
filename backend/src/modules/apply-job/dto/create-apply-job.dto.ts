import { IsOptional, IsMongoId, IsEnum, IsNotEmpty } from "class-validator";

export class CreateApplyJobDto {
  @IsMongoId()
  @IsNotEmpty()
  jobId: string;

  @IsMongoId()
  @IsOptional()
  cvId?: string;

  @IsMongoId()
  @IsOptional()
  coverletterId?: string;
}
