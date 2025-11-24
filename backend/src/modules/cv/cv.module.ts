import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  CvTemplate,
  CvTemplateSchema,
} from "../cv-template/schemas/cv-template.schema";
import { MailModule } from "../mail/mail.module";
import { User, UserSchema } from "../users/schemas/user.schema";
import { AiInterviewController } from "./ai-interview.controller";
import { CvPdfCloudService } from "./cv-pdf-cloud.service";
import { CvController } from "./cv.controller";
import { CvService } from "./cv.service";
import { AiInterviewSession, AiInterviewSessionSchema } from "./schemas/ai-interview.schema";
import { Cv, CvSchema } from "./schemas/cv.schema";
import { InterviewQuestionPool, InterviewQuestionPoolSchema } from "./schemas/interview-question-pool.schema";
import { AiInterviewService } from "./services/ai-interview.service";
import { AiOptimizationService } from "./services/ai-optimization.service";
import { CvAnalysisService } from "./services/cv-analysis.service";
import { CvCacheService } from "./services/cv-cache.service";
import { CvContentGenerationService } from "./services/cv-content-generation.service";
import { CvUploadService } from "./services/cv-upload.service";
import { EncryptionService } from "./services/encryption.service";
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
      { name: AiInterviewSession.name, schema: AiInterviewSessionSchema },
      { name: InterviewQuestionPool.name, schema: InterviewQuestionPoolSchema },
    ]),
    MailModule,
  ],
  controllers: [CvController, AiInterviewController],
  providers: [
    CvService,
    CvPdfCloudService,
    EncryptionService,
    OpenAiService,
    JobAnalysisService,
    CvContentGenerationService,
    CvAnalysisService,
    VietnameseContentService,
    OpenaiApiService,
    CvUploadService,
    CvCacheService,
    AiOptimizationService,
    AiInterviewService,
  ],
  exports: [
    CvService,
    CvPdfCloudService,
    EncryptionService,
    OpenAiService,
    JobAnalysisService,
    CvContentGenerationService,
    CvAnalysisService,
    VietnameseContentService,
    OpenaiApiService,
    CvUploadService,
    CvCacheService,
    AiOptimizationService,
    AiInterviewService,
  ],
})
export class CvModule { }
