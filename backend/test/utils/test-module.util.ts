/*
 * Test Module utilities
 * Override AppModule configuration for testing
 */

import { Injectable, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AccountsModule } from '../../src/modules/accounts/accounts.module';
import { ApplyJobModule } from '../../src/modules/apply-job/apply-job.module';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { BannerModule } from '../../src/modules/banner/banner.module';
import { ChatModule } from '../../src/modules/chat/chat.module';
import { ClTemplateModule } from '../../src/modules/cl-template/cl-template.module';
import { ConversationModule } from '../../src/modules/conversation/conversation.module';
import { CoverLetterModule } from '../../src/modules/cover-letter/cover-letter.module';
import { CreditsModule } from '../../src/modules/credits/credits.module';
import { CvTemplateModule } from '../../src/modules/cv-template/cv-template.module';
import { CvModule } from '../../src/modules/cv/cv.module';
import { FormFeedbackModule } from '../../src/modules/feedback/feedback.module';
import { JobsModule } from '../../src/modules/jobs/jobs.module';
import { MailModule } from '../../src/modules/mail/mail.module';
import { MailService } from '../../src/modules/mail/mail.service';
import { NotificationsModule } from '../../src/modules/notifications/notifications.module';
import { OrdersModule } from '../../src/modules/orders/orders.module';
import { PayosModule } from '../../src/modules/payos/payos.module';
import { RevenueProfitModule } from '../../src/modules/revenue-profit/revenue-profit.module';
import { SavedJobModule } from '../../src/modules/saved-job/saved-job.module';
import { UploadModule } from '../../src/modules/upload/upload.module';
import { UsersModule } from '../../src/modules/users/users.module';
import { VouchersModule } from '../../src/modules/vouchers/vouchers.module';
import { getTestMongoConfig } from '../../src/config/test-database.config';
import { AppController } from '../../src/app.controller';
import { AppService } from '../../src/app.service';

/**
 * Mock MailService for testing
 * Prevents actual email sending during tests
 */
@Injectable()
class MockMailService {
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    // No-op: don't send emails in tests
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    // No-op: don't send emails in tests
  }

  async sendPasswordResetCodeEmail(email: string, code: string): Promise<void> {
    // No-op: don't send emails in tests
  }

  convertBase64ToPdfBuffer(base64Pdf: string): Buffer {
    // Mock implementation for tests
    return Buffer.from('mock-pdf-content');
  }

  async sendCvPdfEmail(
    recipientEmail: string,
    pdfBuffer: Buffer,
    cvTitle: string
  ): Promise<void> {
    // No-op: don't send emails in tests
  }

  async sendEmailActiveHr(email: string): Promise<void> {
    // No-op: don't send emails in tests
  }

  async sendDeleteAccountEmail(
    email: string,
    role: "hr" | "user",
    reason?: string
  ): Promise<void> {
    // No-op: don't send emails in tests
  }
}

/**
 * Create a test module that overrides database configuration
 * This ensures tests use the test database instead of production
 */
@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Use test database config
        return getTestMongoConfig(configService);
      },
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
    RevenueProfitModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class TestAppModule {}

/**
 * Export MockMailService for use in test-app.util.ts
 */
export { MockMailService };

