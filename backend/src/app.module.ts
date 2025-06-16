import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountsModule } from './modules/accounts/accounts.module';
import { AuthModule } from './modules/auth/auth.module';
import { CvTemplateModule } from './modules/cv-template/cv-template.module';
import { CvModule } from './modules/cv/cv.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { MailModule } from './modules/mail/mail.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    AccountsModule,
    AuthModule,
    MailModule,
    UsersModule,
    CvTemplateModule,
    CvModule,
    JobsModule,
  ],
})
export class AppModule {}
