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

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer() server: Server;

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage("sendMessage")
  async handleSendMessage(@MessageBody() dto: SendMessageDto) {
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
}
