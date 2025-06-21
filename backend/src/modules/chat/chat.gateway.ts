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

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer() server: Server;

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
    const message = await this.chatService.saveMessage(dto);

    this.server.to(dto.conversationId).emit("newMessage", message);
  }

  @SubscribeMessage("joinRoom")
  handleJoinRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket
  ) {
    client.join(roomId);
  }

  @SubscribeMessage("readConversation")
  async handleReadConversation(
    @MessageBody() data: { conversationId: string; userId: string }
  ) {
    const { conversationId, userId } = data;

    await this.convModel.getConversationDetail(conversationId, userId);

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
    },
    @ConnectedSocket() client: Socket
  ) {
    const notification = await this.notificationsService.createNotification(
      {
        title: data.title,
        message: data.message,
        type: data.type,
        link: data.link,
      },
      data.userId
    );

    // Gửi thông báo realtime tới người dùng cụ thể
    this.notificationsGateway.sendNotificationToUser(data.userId, notification);
  }
}
