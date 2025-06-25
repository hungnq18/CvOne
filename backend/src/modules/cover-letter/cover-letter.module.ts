import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CoverLetterService } from "./cover-letter.service";
import { CoverLetterController } from "./cover-letter.controller";
import { CoverLetter, CoverLetterSchema } from "./schemas/cover-letter.schema";
import { CvAiService } from "../cv/cv-ai.service";
import { OpenAiService } from "../cv/openai.service";
import { CvModule } from "../cv/cv.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CoverLetter.name, schema: CoverLetterSchema },
    ]),
    CvModule,
  ],
  controllers: [CoverLetterController],
  providers: [CoverLetterService],
})
export class CoverLetterModule {}
