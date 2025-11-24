import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MailModule } from "../mail/mail.module";
import { UsersModule } from "../users/users.module";
import { AccountsController } from "./accounts.controller";
import { AccountsService } from "./accounts.service";
import { Account, AccountSchema } from "./schemas/account.schema";
import { PasswordResetCodeService } from "./password-reset-code.service";
import { CreditsModule } from "../credits/credits.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),

    forwardRef(() => UsersModule),
    forwardRef(() => MailModule), // Sửa ở đây
    CreditsModule,
  ],
  controllers: [AccountsController],
  providers: [AccountsService, PasswordResetCodeService],
  exports: [AccountsService],
})
export class AccountsModule {}
