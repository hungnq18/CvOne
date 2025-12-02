import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service";
import { SendMessageDto } from "./dto/send-message.dto";
import { NotificationsGateway } from "../notifications/notifications.gateway";
import { NotificationsService } from "../notifications/notifications.service";
import { ConversationService } from "../conversation/conversation.service";

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
  transports: ["websocket", "polling"], // Support both transports
})
export class ChatGateway {
  @WebSocketServer() server: Server;

  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Constructor for the ChatGateway class.
   *
   * @param {ChatService} chatService - the service for handling chat business logic
   * @param {NotificationsService} notificationsService - the service for handling notifications business logic
   * @param {NotificationsGateway} notificationsGateway - the gateway for handling notifications business logic
   * @param {ConversationService} convModel - the service for handling conversation business logic
   */
  /*******  7ec7eab5-ae12-4963-9e86-8267d45a50f4  *******/
  constructor(
    private readonly chatService: ChatService,
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly convModel: ConversationService
  ) {}

  @SubscribeMessage("sendMessage")
  async handleSendMessage(
    @MessageBody() dto: SendMessageDto,
    @ConnectedSocket() client: Socket
  ) {
    try {
      const message = await this.chatService.saveMessage(dto);

      // Emit về tất cả clients trong room (bao gồm cả sender)
      this.server.to(dto.conversationId).emit("newMessage", message);

      // Đảm bảo emit về cả sender nếu chưa join room
      client.emit("newMessage", message);
    } catch (error) {
      console.error("❌ Error in handleSendMessage:", error);
      // Emit error về client
      client.emit("messageError", {
        error: error.message || "Failed to send message",
      });
    }
  }

  @SubscribeMessage("joinRoom")
  async handleJoinRoom(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket
  ) {
    // 1️⃣ join room
    client.join(conversationId);

    // 2️⃣ lấy toàn bộ message của conversation
    const messages =
      await this.chatService.getMessagesByConversationId(conversationId);

    // 3️⃣ emit trả lại cho client vừa join
    client.emit("conversation:messages", {
      conversationId,
      messages,
    });
  }

  @SubscribeMessage("readConversation")
  async handleReadConversation(
    @MessageBody() data: { conversationId: string; userId: string }
  ) {
    const { conversationId, userId } = data;

    await this.chatService.readConversation(conversationId, userId);

    // Optional: emit update về client để sync UI
    this.server.to(conversationId).emit("unreadReset", {
      userId,
      conversationId,
    });
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

    // Gửi thông báo realtime tới người dùng cụ thể
    this.notificationsGateway.sendNotificationToUser(data.userId, notification);
  }
}
