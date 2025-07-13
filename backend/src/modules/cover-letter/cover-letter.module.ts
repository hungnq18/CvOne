import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CvModule } from "../cv/cv.module";
import { CoverLetterAiService } from "./cover-letter-ai.service";
import { CoverLetterController } from "./cover-letter.controller";
import { CoverLetterService } from "./cover-letter.service";
import { CoverLetter, CoverLetterSchema } from "./schemas/cover-letter.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CoverLetter.name, schema: CoverLetterSchema },
    ]),
    CvModule,
  ],
  controllers: [CoverLetterController],
  providers: [CoverLetterService, CoverLetterAiService],
  exports: [CoverLetterService, CoverLetterAiService],
})
export class CoverLetterModule {}
