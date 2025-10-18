import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CvTemplateController } from "./cv-template.controller";
import { CvTemplateService } from "./cv-template.service";
import { CvTemplate, CvTemplateSchema } from "./schemas/cv-template.schema";
import { CvTemplateAiService } from "./cv-template-ai.service";

import { ConfigModule } from "@nestjs/config";
import { UsersModule } from "../users/users.module";
import { CvModule } from "../cv/cv.module";

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: CvTemplate.name, schema: CvTemplateSchema },
    ]),
    UsersModule,
    CvModule,
  ],
  controllers: [CvTemplateController],
  providers: [CvTemplateService, CvTemplateAiService],
  exports: [CvTemplateService, CvTemplateAiService],
})
export class CvTemplateModule {}
