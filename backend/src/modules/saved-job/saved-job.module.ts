import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SavedJob, SavedJobSchema } from "./schemas/saved-job.schema";
import { SavedJobService } from "./saved-job.service";
import { SavedJobController } from "./saved-job.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SavedJob.name, schema: SavedJobSchema },
    ]),
  ],
  providers: [SavedJobService],
  controllers: [SavedJobController],
})
export class SavedJobModule {}
