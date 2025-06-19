import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";
import { Message, MessageSchema } from "./schemas/message.schema";
import {
  Conversation,
  ConversationSchema,
} from "./schemas/conversation.schema";
import { ChatController } from "./chat.controller";
import { UsersModule } from "../users/users.module";
import { NotificationsService } from "../notifications/notifications.service";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Conversation.name, schema: ConversationSchema },
    ]),
    UsersModule,
    NotificationsModule,
  ],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
