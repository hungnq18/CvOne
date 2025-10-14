import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CvTemplateController } from "./cv-template.controller";
import { CvTemplateService } from "./cv-template.service";
import { CvTemplate, CvTemplateSchema } from "./schemas/cv-template.schema";

/**
 * Module for CV Template functionality
 * Registers all necessary components for CV template management
 *
 * Components:
 * - Controller: Handles HTTP requests
 * - Service: Contains business logic
 * - Schema: Defines database structure
 */
import { CvTemplateAiService } from "./cv-template-ai.service";
import { ConfigModule } from "@nestjs/config";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: CvTemplate.name, schema: CvTemplateSchema },
    ]),
    UsersModule,
  ],
  controllers: [CvTemplateController],
  providers: [CvTemplateService, CvTemplateAiService],
  exports: [CvTemplateService, CvTemplateAiService],
})
export class CvTemplateModule {}
