import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ApplyJob, ApplyJobSchema } from "./schemas/apply-job.schema";
import { ApplyJobService } from "./apply-job.service";
import { ApplyJobController } from "./apply-job.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ApplyJob.name, schema: ApplyJobSchema },
    ]),
  ],
  providers: [ApplyJobService],
  controllers: [ApplyJobController],
})
export class ApplyJobModule {}
