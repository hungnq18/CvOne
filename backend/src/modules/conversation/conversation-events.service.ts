import { Injectable } from "@nestjs/common";
import { Server } from "socket.io";

@Injectable()
export class ConversationEventsService {
  private server: Server;

  setServer(server: Server) {
    this.server = server;
  }

  emitNewConversation(conversation: any) {
    conversation.participants.forEach((userId: any) => {
      const id = userId.toString();

      this.server?.to(`user:${id}`).emit("conversation:new", conversation);
    });
  }
}
