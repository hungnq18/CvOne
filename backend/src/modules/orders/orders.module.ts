import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CvModule } from "../cv/cv.module";
import { UsersModule } from "../users/users.module";

import { NotificationsModule } from "../notifications/notifications.module";
import { Order, OrderSchema } from "./schemas/order.schema";
import { OrdersService } from "./orders.service";
import { OrdersController } from "./orders.controller";
import { PayosModule } from "../payos/payos.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    PayosModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
