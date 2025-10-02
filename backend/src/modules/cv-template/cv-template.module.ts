import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CvTemplateController } from "./cv-template.controller";
import { CvTemplateService } from "./cv-template.service";
import { CvTemplate, CvTemplateSchema } from "./schemas/cv-template.schema";
import { CvTemplateAiService } from "./cv-template-ai.service";

import { CategoryCvModule } from "../category-cv/category-cv.module";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: CvTemplate.name, schema: CvTemplateSchema },
    ]),
    CategoryCvModule,
  ],
  controllers: [CvTemplateController],
  providers: [CvTemplateService, CvTemplateAiService],
  exports: [CvTemplateService, CvTemplateAiService],
})
export class CvTemplateModule {}
