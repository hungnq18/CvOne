import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CvModule } from "../cv/cv.module";
import { UsersModule } from "../users/users.module";
import { VouchersController } from "./vouchers.controller";
import { VouchersService } from "./vouchers.service";
import { Voucher, VoucherSchema } from "./schemas/voucher.schema";
import { NotificationsModule } from "../notifications/notifications.module";
import { CreditsModule } from "../credits/credits.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Voucher.name, schema: VoucherSchema }]),
  ],
  controllers: [VouchersController],
  providers: [VouchersService],
  exports: [VouchersService],
})
export class VouchersModule {}
