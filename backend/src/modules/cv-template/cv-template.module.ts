import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CvTemplateController } from "./cv-template.controller";
import { CvTemplateService } from "./cv-template.service";
import { CvTemplate, CvTemplateSchema } from "./schemas/cv-template.schema";
<<<<<<< HEAD

/**
 * Module for CV Template functionality
 * Registers all necessary components for CV template management
 *
 * Components:
 * - Controller: Handles HTTP requests
 * - Service: Contains business logic
 * - Schema: Defines database structure
 */
=======
import { CvTemplateAiService } from "./cv-template-ai.service";

import { CategoryCvModule } from "../category-cv/category-cv.module";
import { ConfigModule } from "@nestjs/config";

>>>>>>> d4455e8b3e4f567962e0fb5d8472edb309ec5ea3
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
