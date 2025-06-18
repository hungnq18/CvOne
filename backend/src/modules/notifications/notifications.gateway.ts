import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ cors: true })
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private users = new Map<string, string>(); // userId -> socketId

  // Khi kết nối socket
  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.users.set(userId, client.id);
      console.log(`✅ User connected: ${userId} → socket ${client.id}`);
    }
  }

  // Khi ngắt kết nối socket
  handleDisconnect(client: Socket) {
    this.users.forEach((socketId, userId) => {
      if (socketId === client.id) {
        this.users.delete(userId);
        console.log(`User disconnected: ${userId}`);
      }
    });
  }

  // Hàm dùng từ service để gửi real-time
  sendNotificationToUser(userId: string, payload: any) {
    const socketId = this.users.get(userId);
    if (socketId) {
      this.server.to(socketId).emit("notification", payload);
      console.log(`📡 Emit notification to ${userId}:`, payload);
    }
  }

  // Có thể bổ sung để client chủ động yêu cầu (nếu muốn)
  @SubscribeMessage("pingNotification")
  handlePingNotification(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket
  ) {
    console.log("Ping received:", data);
    client.emit("pongNotification", { ok: true });
  }
}
