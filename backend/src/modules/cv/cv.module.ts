import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  CvTemplate,
  CvTemplateSchema,
} from "../cv-template/schemas/cv-template.schema";
import { User, UserSchema } from "../users/schemas/user.schema";
import { CvAiService } from "./cv-ai.service";
import { CvPdfService } from "./cv-pdf.service";
import { CvController } from "./cv.controller";
import { CvService } from "./cv.service";
import { OpenAiService } from "./openai.service";
import { Cv, CvSchema } from "./schemas/cv.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cv.name, schema: CvSchema },
      { name: CvTemplate.name, schema: CvTemplateSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [CvController],
  providers: [CvService, CvAiService, OpenAiService, CvPdfService],
  exports: [CvService, CvAiService, OpenAiService, CvPdfService],
})
export class CvModule {}
