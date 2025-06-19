import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
} from "@nestjs/common";
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
  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserConversations(@Request() req) {
    const userId = req.user.user._id;
    return this.conversationService.getUserConversations(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":conversationId")
  async getConversationDetail(
    @Request() req,
    @Param("conversationId") conversationId: string
  ) {
    const userId = req.user.user._id;
    return this.conversationService.getConversationDetail(
      conversationId,
      userId
    );
  }
}
