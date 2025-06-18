import { Module } from "@nestjs/common";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";
import { MongooseModule } from "@nestjs/mongoose";
import { NotificationSchema } from "./schemas/notification.schema";
import { Notification } from "./schemas/notification.schema";
import { NotificationsGateway } from "./notifications.gateway";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway],
  exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}
