import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { VouchersModule } from "../vouchers/vouchers.module";
import { AiUsageLog, AiUsageLogSchema } from "./schemas/ai-usage-log.schema";
import { AiUsageLogService } from "./ai-usage-log.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AiUsageLog.name, schema: AiUsageLogSchema },
    ]),
  ],
  providers: [AiUsageLogService],
  exports: [AiUsageLogService],
})
export class AiUsageLogModule {}
