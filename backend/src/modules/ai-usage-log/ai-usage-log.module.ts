import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { VouchersModule } from "../vouchers/vouchers.module";
import { AiUsageLog, AiUsageLogSchema } from "./schemas/ai-usage-log.schema";
import { AiUsageLogService } from "./ai-usage-log.service";
import { CreditsModule } from "../credits/credits.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AiUsageLog.name, schema: AiUsageLogSchema },
    ]),
    forwardRef(() => CreditsModule),
  ],
  providers: [AiUsageLogService],
  exports: [AiUsageLogService],
})
export class AiUsageLogModule {}
