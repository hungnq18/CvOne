import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ApplyJob, ApplyJobSchema } from "./schemas/apply-job.schema";
import { ApplyJobService } from "./apply-job.service";
import { ApplyJobController } from "./apply-job.controller";
import { Job, JobSchema } from "../jobs/schemas/job.schema";
import { JobsModule } from "../jobs/jobs.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ApplyJob.name, schema: ApplyJobSchema },
    ]),
    JobsModule,
  ],
  providers: [ApplyJobService],
  controllers: [ApplyJobController],
})
export class ApplyJobModule {}
