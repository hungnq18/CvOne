import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { User } from "../../common/decorators/user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ConversationService } from "./conversation.service";
import { CreateConversationDto } from "./dto/create-conversation.dto";

@Controller("conversations")
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createConversation(@Body() dto: CreateConversationDto) {
    return this.conversationService.createConversation(dto);
  }
  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserConversations(@User("_id") userId: string) {
    return this.conversationService.getUserConversations(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":conversationId")
  async getConversationDetail(
    @User("_id") userId: string,
    @Param("conversationId") conversationId: string,
  ) {
    return this.conversationService.getConversationDetail(
      conversationId,
      userId,
    );
  }
}
