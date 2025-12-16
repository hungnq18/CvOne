import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { Credit, CreditSchema } from "./schemas/credit.schema";
import { CreditsController } from "./credits.controller";
import { CreditsService } from "./credits.service";
import { VouchersModule } from "../vouchers/vouchers.module";
import { AiUsageLogModule } from "../ai-usage-log/ai-usage-log.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Credit.name, schema: CreditSchema }]),
    VouchersModule,
    forwardRef(() => AiUsageLogModule),
  ],
  controllers: [CreditsController],
  providers: [CreditsService],
  exports: [CreditsService],
})
export class CreditsModule {}
