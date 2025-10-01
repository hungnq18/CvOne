import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ cors: true })
export class NotificationsGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage("joinNotificationRoom")
  handleJoinNotificationRoom(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`${userId}`);
  }

  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(userId).emit("newNotification", notification);
  }

  @SubscribeMessage("leaveNotificationRoom")
  handleLeaveNotificationRoom(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`${userId}`);
  }
}
