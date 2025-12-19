import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  Conversation,
  ConversationSchema,
} from "../chat/schemas/conversation.schema";
import { ConversationService } from "./conversation.service";
import { ConversationController } from "./conversation.controller";
import { ConversationEventsService } from "./conversation-events.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
    ]),
  ],
  controllers: [ConversationController],
  providers: [ConversationService, ConversationEventsService],
  exports: [ConversationService, ConversationEventsService],
})
export class ConversationModule {}
