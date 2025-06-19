import { IsOptional, IsMongoId, IsEnum } from "class-validator";
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
  @IsMongoId()
  coverletterId?: string;
}
