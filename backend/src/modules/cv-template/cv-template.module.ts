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
@Module({
  imports: [
    // Register the CV Template schema with Mongoose
    MongooseModule.forFeature([
      { name: CvTemplate.name, schema: CvTemplateSchema },
    ]),
  ],
  controllers: [CvTemplateController],
  providers: [CvTemplateService],
  exports: [CvTemplateService], // Export service for use in other modules
})
export class CvTemplateModule {}
