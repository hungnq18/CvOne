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
import { AiOptimizationService } from "./services/ai-optimization.service";
import { CvCacheService } from "./services/cv-cache.service";
import { CvUploadService } from "./services/cv-upload.service";
import { MailModule } from "../mail/mail.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cv.name, schema: CvSchema },
      { name: CvTemplate.name, schema: CvTemplateSchema },
      { name: User.name, schema: UserSchema },
    ]),
    MailModule,
  ],
  controllers: [CvController],
  providers: [
    CvService,
    CvAiService,
    OpenAiService,
    CvPdfService,
    CvUploadService,
    CvCacheService,
    AiOptimizationService,
  ],
  exports: [
    CvService,
    CvAiService,
    OpenAiService,
    CvPdfService,
    CvUploadService,
    CvCacheService,
    AiOptimizationService,
  ],
})
export class CvModule { }
