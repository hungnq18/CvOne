import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ClTemplateService } from "./cl-template.service";
import { ClTemplateController } from "./cl-template.controller";
import { ClTemplate, ClTemplateSchema } from "./schemas/cl-template.schema";
import { CvTemplateModule } from "../cv-template/cv-template.module";
import { AiCoreModule } from "../AiCore/ai-core.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClTemplate.name, schema: ClTemplateSchema },
    ]),
    CvTemplateModule,
    AiCoreModule,
  ],
  controllers: [ClTemplateController],
  providers: [ClTemplateService],
  exports: [ClTemplateService],
})
export class ClTemplateModule {}
