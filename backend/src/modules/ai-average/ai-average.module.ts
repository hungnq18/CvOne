import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AiAverageStatsService } from "./ai-average.service";
import { AiAverageStatsController } from "./ai-average.controller";
import {
  AiAverageStats,
  AiAverageStatsSchema,
} from "./schemas/ai-averege.schemas";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AiAverageStats.name, schema: AiAverageStatsSchema },
    ]),
  ],
  providers: [AiAverageStatsService],
  controllers: [AiAverageStatsController],
  exports: [AiAverageStatsService],
})
export class AiAverageModule {}
