import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { ConversationService } from "./conversation.service";
import { CreateConversationDto } from "./dto/create-conversation.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("conversations")
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createConversation(@Body() dto: CreateConversationDto) {
    return this.conversationService.createConversation(dto);
  }
}
