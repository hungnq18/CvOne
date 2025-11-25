// form-feedback.module.ts
import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { FormFeedbackService } from "./feedback.service";
import { FormFeedbackController } from "./feedback.controller";
import { FormFeedback, FormFeedbackSchema } from "./schemas/feedback.schema";
import { UsersModule } from "../users/users.module";
import { CreditsModule } from "../credits/credits.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FormFeedback.name, schema: FormFeedbackSchema },
    ]),
    forwardRef(() => UsersModule),
    forwardRef(() => CreditsModule),
  ],
  providers: [FormFeedbackService],
  controllers: [FormFeedbackController],
  exports: [FormFeedbackService],
})
export class FormFeedbackModule {}
