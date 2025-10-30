import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ClTemplateService } from "./cl-template.service";
import { ClTemplateController } from "./cl-template.controller";
import { ClTemplate, ClTemplateSchema } from "./schemas/cl-template.schema";
import { CvTemplateModule } from "../cv-template/cv-template.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClTemplate.name, schema: ClTemplateSchema },
    ]),
    CvTemplateModule,
  ],
  controllers: [ClTemplateController],
  providers: [ClTemplateService],
  exports: [ClTemplateService],
})
export class ClTemplateModule {}
