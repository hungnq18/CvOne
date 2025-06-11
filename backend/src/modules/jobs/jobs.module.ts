import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JobsService } from "./jobs.service";
import { Job, JobSchema } from "./schemas/job.schema";
import { JobsController } from "./jobs.controller";

@Module({
  imports: [MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }])],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService], // Export if needed in other modules
})
export class JobsModule {}
