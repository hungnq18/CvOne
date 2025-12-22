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
  @SubscribeMessage("notification:join")
  async join(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
    const room = `user:${userId}`;

    client.join(room);

    const notifications =
      await this.notificationsService.getNotificationsByUser(userId);

    client.emit("notification:init", notifications);
  }

  emitNewNotification(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit("notification:new", notification);
  }

  @SubscribeMessage("newNotification")
  sendNotificationToUser(userId: string, notification: any) {
    const room = `user:${userId}`;
    this.server.to(room).emit("notification:new", notification);
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
    this.server.to(`user:${userId}`).emit("unreadReset", {
      notificationId,
      userId,
    });

    return updatedNotification;
  }

  @SubscribeMessage("sendRealtimeNotification")
  async handleRealtimeNotification(
    @MessageBody()
    data: {
      userId: string;
      title: string;
      message: string;
      type: string;
      link?: string;
      jobId: string;
    },
    @ConnectedSocket() client: Socket
  ) {
    const notification = await this.notificationsService.createNotification(
      {
        title: data.title,
        message: data.message,
        type: data.type,
        link: data.link,
        jobId: data.jobId || "",
      },
      data.userId
    );

    const room = `user:${data.userId}`;
    this.server.to(room).emit("newNotification", notification);
  }
}
