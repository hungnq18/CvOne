import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AccountsModule } from "./modules/accounts/accounts.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CvTemplateModule } from "./modules/cv-template/cv-template.module";
import { CvModule } from "./modules/cv/cv.module";
import { JobsModule } from "./modules/jobs/jobs.module";
import { MailModule } from "./modules/mail/mail.module";
import { UsersModule } from "./modules/users/users.module";
import { ChatModule } from "./modules/chat/chat.module";
import { ConversationModule } from "./modules/conversation/conversation.module";
import { MailerModule } from "@nestjs-modules/mailer";
import { join } from "path";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { ClTemplateModule } from "./modules/cl-template/cl-template.module";
import { CoverLetter } from "./modules/cover-letter/schemas/cover-letter.schema";
import { CoverLetterModule } from "./modules/cover-letter/cover-letter.module";
import { ApplyJobModule } from "./modules/apply-job/apply-job.module";
import { SavedJobModule } from "./modules/saved-job/saved-job.module";
import { UploadModule } from "./modules/upload/upload.module";
import { ScheduleModule } from "@nestjs/schedule";
import { FilesModule } from "./modules/files/files.module";
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
    FilesModule,
    CvModule,
    JobsModule,
    ChatModule,
    ConversationModule,
    SavedJobModule,
    UploadModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get("MAIL_HOST"),
          port: configService.get("MAIL_PORT"),
          secure: configService.get("MAIL_SECURE") === "true",
          auth: {
            user: configService.get("MAIL_USER"),
            pass: configService.get("MAIL_PASS"),
          },
        },
        defaults: {
          from: `"CV Builder" <${configService.get("MAIL_FROM")}>`,
        },
        template: {
          dir: join(__dirname, "templates"),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    NotificationsModule,
    ClTemplateModule,
    CoverLetterModule,
    ApplyJobModule,
  ],
})
export class AppModule {}
