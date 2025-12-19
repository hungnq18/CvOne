import { Injectable } from "@nestjs/common";
import { Server } from "socket.io";

@Injectable()
export class ConversationEventsService {
  private server: Server;

  setServer(server: Server) {
    this.server = server;
  }

  emitNewConversation(conversation: any) {
    console.log("🚀 emitNewConversation", conversation._id);

    conversation.participants.forEach((userId: any) => {
      const id = userId.toString();
      console.log("➡️ emit to room:", `user:${id}`);

      this.server?.to(`user:${id}`).emit("conversation:new", conversation);
    });
  }
}
