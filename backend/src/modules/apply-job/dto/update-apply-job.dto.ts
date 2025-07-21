import {
  IsOptional,
  IsMongoId,
  IsEnum,
  IsString,
  ValidateIf,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export enum ApplyJobStatus {
  PENDING = "pending",
  REVIEWED = "reviewed",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

export class UpdateApplyJobByHrDto {
  @ApiPropertyOptional({ enum: ApplyJobStatus })
  @IsOptional()
  @IsEnum(ApplyJobStatus)
  status?: ApplyJobStatus;
}

export class UpdateApplyJobByUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  cvId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cvUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  coverletterId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverletterUrl?: string;

  // Validate rằng nếu cập nhật CV, phải có ít nhất cvId hoặc cvUrl
  @ValidateIf(
    (o) =>
      !o.cvId && !o.cvUrl && (o.cvId !== undefined || o.cvUrl !== undefined),
  )
  @IsString({
    message: "Phải cung cấp ít nhất cvId hoặc cvUrl khi cập nhật CV",
  })
  _cvValidation?: string;

  // Validate rằng nếu cập nhật Cover Letter, phải có ít nhất coverletterId hoặc coverletterUrl
  @ValidateIf(
    (o) =>
      !o.coverletterId &&
      !o.coverletterUrl &&
      (o.coverletterId !== undefined || o.coverletterUrl !== undefined),
  )
  @IsString({
    message:
      "Phải cung cấp ít nhất coverletterId hoặc coverletterUrl khi cập nhật Cover Letter",
  })
  _coverletterValidation?: string;
}
