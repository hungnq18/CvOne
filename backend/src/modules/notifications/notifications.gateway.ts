import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { NotificationsService } from "./notifications.service";

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
  transports: ["websocket", "polling"],
})
export class NotificationsGateway {
  @WebSocketServer() server: Server;
  constructor(private notificationsService: NotificationsService) {}
  @SubscribeMessage("joinNotificationRoom")
  async handleJoinNotificationRoom(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket
  ) {
    client.join(`${userId}`);
    const notifications =
      await this.notificationsService.getNotificationsByUser(userId);
    client.emit("notifications", notifications);
  }

  @SubscribeMessage("newNotification")
  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(userId).emit("newNotification", notification);
  }

  @SubscribeMessage("leaveNotificationRoom")
  handleLeaveNotificationRoom(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket
  ) {
    client.leave(`${userId}`);
  }

  @SubscribeMessage("markNotificationAsRead")
  async handleMarkNotificationAsRead(
    @MessageBody() data: { userId: string; notificationId: string },
    @ConnectedSocket() client: Socket
  ) {
    const { userId, notificationId } = data;

    // Cập nhật trong database
    const updatedNotification = await this.notificationsService.markAsRead(
      notificationId,
      userId
    );

    // Gửi về client vừa đánh dấu
    client.emit("notificationMarkedAsRead", updatedNotification);

    // (Tùy chọn) gửi update cho tất cả client khác trong room nếu cần
    this.server.to(userId).emit("unreadReset", {
      notificationId,
      userId,
    });

    return updatedNotification;
  }
}
