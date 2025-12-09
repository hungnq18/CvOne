import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ScheduleModule } from "@nestjs/schedule";
import { AccountsModule } from "./modules/accounts/accounts.module";
import { ApplyJobModule } from "./modules/apply-job/apply-job.module";
import { AuthModule } from "./modules/auth/auth.module";
import { BannerModule } from "./modules/banner/banner.module";
import { ChatModule } from "./modules/chat/chat.module";
import { ClTemplateModule } from "./modules/cl-template/cl-template.module";
import { ConversationModule } from "./modules/conversation/conversation.module";
import { CoverLetterModule } from "./modules/cover-letter/cover-letter.module";
import { CreditsModule } from "./modules/credits/credits.module";
import { CvTemplateModule } from "./modules/cv-template/cv-template.module";
import { CvModule } from "./modules/cv/cv.module";
import { FormFeedbackModule } from "./modules/feedback/feedback.module";
import { JobsModule } from "./modules/jobs/jobs.module";
import { MailModule } from "./modules/mail/mail.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { PayosModule } from "./modules/payos/payos.module";
import { SavedJobModule } from "./modules/saved-job/saved-job.module";
import { UploadModule } from "./modules/upload/upload.module";
import { UsersModule } from "./modules/users/users.module";
import { VouchersModule } from "./modules/vouchers/vouchers.module";
@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>("MONGODB_URI"),
      }),
      inject: [ConfigService],
    }),
    AccountsModule,
    AuthModule,
    MailModule,
    UsersModule,
    CvTemplateModule,
    CvModule,
    BannerModule,
    JobsModule,
    ChatModule,
    ConversationModule,
    SavedJobModule,
    UploadModule,
    NotificationsModule,
    ClTemplateModule,
    CoverLetterModule,
    ApplyJobModule,
    PayosModule,
    VouchersModule,
    OrdersModule,
    CreditsModule,
    FormFeedbackModule,
  ],
})
export class AppModule {}
