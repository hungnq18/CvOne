// form-feedback.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { FormFeedbackService } from "./feedback.service";
import { FormFeedbackController } from "./feedback.controller";
import { FormFeedback, FormFeedbackSchema } from "./schemas/feedback.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FormFeedback.name, schema: FormFeedbackSchema },
    ]),
  ],
  providers: [FormFeedbackService],
  controllers: [FormFeedbackController],
  exports: [FormFeedbackService],
})
export class FormFeedbackModule {}
