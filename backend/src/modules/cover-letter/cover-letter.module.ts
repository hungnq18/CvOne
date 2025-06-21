import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CoverLetterService } from "./cover-letter.service";
import { CoverLetterController } from "./cover-letter.controller";
import { CoverLetter, CoverLetterSchema } from "./schemas/cover-letter.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CoverLetter.name, schema: CoverLetterSchema },
    ]),
  ],
  controllers: [CoverLetterController],
  providers: [CoverLetterService],
})
export class CoverLetterModule {}
