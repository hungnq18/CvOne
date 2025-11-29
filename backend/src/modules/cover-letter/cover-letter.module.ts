import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CvModule } from "../cv/cv.module";
import { CoverLetterAiService } from "./cover-letter-ai.service";
import { CoverLetterController } from "./cover-letter.controller";
import { CoverLetterService } from "./cover-letter.service";
import { CoverLetter, CoverLetterSchema } from "./schemas/cover-letter.schema";
import { AiUsageLogModule } from "../ai-usage-log/ai-usage-log.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CoverLetter.name, schema: CoverLetterSchema },
    ]),
    CvModule,
    AiUsageLogModule,
  ],
  controllers: [CoverLetterController],
  providers: [CoverLetterService, CoverLetterAiService],
  exports: [CoverLetterService, CoverLetterAiService],
})
export class CoverLetterModule {}
