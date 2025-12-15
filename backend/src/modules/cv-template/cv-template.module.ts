import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CvTemplateController } from "./cv-template.controller";
import { CvTemplateService } from "./cv-template.service";
import { CvTemplate, CvTemplateSchema } from "./schemas/cv-template.schema";
import { CvTemplateAiService } from "./cv-template-ai.service";

import { ConfigModule } from "@nestjs/config";
import { UsersModule } from "../users/users.module";
import { CvModule } from "../cv/cv.module";
import { AiUsageLogModule } from "../ai-usage-log/ai-usage-log.module";
import { AiCoreModule } from "../AiCore/ai-core.module";

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: CvTemplate.name, schema: CvTemplateSchema },
    ]),
    UsersModule,
    CvModule,
    AiUsageLogModule,
    AiCoreModule,
  ],
  controllers: [CvTemplateController],
  providers: [CvTemplateService, CvTemplateAiService],
  exports: [CvTemplateService, CvTemplateAiService],
})
export class CvTemplateModule {}
