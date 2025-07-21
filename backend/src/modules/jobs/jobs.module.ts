import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CvModule } from '../cv/cv.module';
import { UsersModule } from "../users/users.module";
import { JobsController } from "./jobs.controller";
import { JobsService } from "./jobs.service";
import { Job, JobSchema } from "./schemas/job.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]),
    UsersModule,
    CvModule, // Thêm dòng này
  ],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService], // Export if needed in other modules
})
export class JobsModule {}
