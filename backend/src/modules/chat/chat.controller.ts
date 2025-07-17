import {
  Controller,
  Get,
  Param,
  Request,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { ChatService } from "./chat.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @UseGuards(JwtAuthGuard)
  @Get("messages/:conversationId")
  getMessages(@Param("conversationId") conversationId: string) {
    return this.chatService.getMessagesByConversationId(conversationId);
  }
}
