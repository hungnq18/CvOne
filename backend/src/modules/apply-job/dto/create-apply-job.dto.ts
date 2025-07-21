import {
  IsMongoId,
  IsString,
  IsOptional,
  ValidateIf,
  IsNotEmpty,
} from "class-validator";

export class CreateApplyJobDto {
  @IsMongoId()
  @IsNotEmpty()
  jobId: string;

  @IsMongoId()
  @IsOptional()
  cvId?: string;

  @IsString()
  @IsOptional()
  cvUrl?: string;

  @IsMongoId()
  @IsOptional()
  coverletterId?: string;

  @IsString()
  @IsOptional()
  coverletterUrl?: string;

  // Validate rằng ít nhất một trong cvId hoặc cvUrl phải có giá trị
  @ValidateIf((o) => !o.cvId && !o.cvUrl)
  @IsString({ message: "Phải cung cấp ít nhất cvId hoặc cvUrl" })
  _cvValidation?: string;

  // Validate rằng ít nhất một trong coverletterId hoặc coverletterUrl phải có giá trị
  @ValidateIf((o) => !o.coverletterId && !o.coverletterUrl)
  @IsString({
    message: "Phải cung cấp ít nhất coverletterId hoặc coverletterUrl",
  })
  _coverletterValidation?: string;
}
