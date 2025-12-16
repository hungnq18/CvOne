import { Module } from "@nestjs/common";
import { CreditsModule } from "../credits/credits.module";
import { AiUsageLogModule } from "../ai-usage-log/ai-usage-log.module";

@Module({
  imports: [CreditsModule, AiUsageLogModule],
  exports: [CreditsModule, AiUsageLogModule],
})
export class AiCoreModule {}
