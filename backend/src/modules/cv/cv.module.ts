import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  CvTemplate,
  CvTemplateSchema,
} from "../cv-template/schemas/cv-template.schema";
import { MailModule } from "../mail/mail.module";
import { User, UserSchema } from "../users/schemas/user.schema";
import { CvAiService } from "./cv-ai.service";
import { CvPdfCloudService } from "./cv-pdf-cloud.service";
import { CvPdfService } from "./cv-pdf.service";
import { CvController } from "./cv.controller";
import { CvService } from "./cv.service";
import { Cv, CvSchema } from "./schemas/cv.schema";
import { AiOptimizationService } from "./services/ai-optimization.service";
import { CvAnalysisService } from "./services/cv-analysis.service";
import { CvCacheService } from "./services/cv-cache.service";
import { CvContentGenerationService } from "./services/cv-content-generation.service";
import { CvUploadService } from "./services/cv-upload.service";
import { JobAnalysisService } from "./services/job-analysis.service";
import { OpenaiApiService } from "./services/openai-api.service";
import { OpenAiService } from "./services/openai.service";
import { VietnameseContentService } from "./services/vietnamese-content.service";

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
    JobAnalysisService,
    CvContentGenerationService,
    CvAnalysisService,
    VietnameseContentService,
    OpenaiApiService,
    CvPdfService,
    CvPdfCloudService,
    CvUploadService,
    CvCacheService,
    AiOptimizationService,
  ],
  exports: [
    CvService,
    CvAiService,
    OpenAiService,
    JobAnalysisService,
    CvContentGenerationService,
    CvAnalysisService,
    VietnameseContentService,
    OpenaiApiService,
    CvPdfService,
    CvPdfCloudService,
    CvUploadService,
    CvCacheService,
    AiOptimizationService,
  ],
})
export class CvModule { }
