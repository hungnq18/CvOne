import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Message } from "./schemas/message.schema";
import { Conversation } from "./schemas/conversation.schema";
import { SendMessageDto } from "./dto/send-message.dto";
import { UsersService } from "../users/users.service";

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(Conversation.name) private convModel: Model<Conversation>,
    private userService: UsersService,
  ) { }

  async saveMessage(dto: SendMessageDto) {
    try {
      const conversationId = new Types.ObjectId(dto.conversationId);
      const senderId = new Types.ObjectId(dto.senderId);
      const receiverId = new Types.ObjectId(dto.receiverId);

      if (!conversationId || !senderId || !receiverId) {
        throw new Error("Invalid conversationId or senderId or receiverId");
      }

      // 1. Tạo tin nhắn mới
      const message = await this.messageModel.create({
        conversationId,
        senderId,
        receiverId,
        content: dto.content,
      });

      // 2. Tìm conversation
      const conversation = await this.convModel.findById(conversationId);
      if (!conversation) {
        throw new Error("Conversation not found");
      }

      // 3. Cập nhật lastMessage
      conversation.lastMessage = message._id as Types.ObjectId;

      // 4. Cập nhật unreadCount cho người nhận
      const receiverIdStr = receiverId.toString();
      let found = false;

      conversation.unreadCount = (conversation.unreadCount || []).map((entry) => {
        if (entry.userId.toString() === receiverIdStr) {
          found = true;
          return {
            userId: entry.userId,
            count: entry.count + 1,
          };
        }
        return entry;
      });

      if (!found) {
        conversation.unreadCount.push({
          userId: receiverId,
          count: 1,
        });
      }

      await conversation.save();

      // Populate senderId trước khi trả về cho socket
      const populatedMessage = await this.messageModel
        .findById(message._id)
        .populate("senderId", "first_name last_name")
        .lean()
        .exec();

      return populatedMessage || message;
    } catch (error) {
      console.error("Error in saveMessage:", error);
      throw error;
    }
  }

  async getMessagesByConversationId(conversationId: string) {
    return this.messageModel
      .find({ conversationId: new Types.ObjectId(conversationId) })
      .sort({ createdAt: 1 }) // tăng dần theo thời gian
      .populate("senderId", "first_name last_name") // Populate đúng fields từ User schema
      .lean()
      .exec();
  }

  async readConversation(conversationId: string, userId: string) {
    const conversation = await this.convModel.findById(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    // Reset unreadCount cho user này
    conversation.unreadCount = (conversation.unreadCount || []).map((entry) => {
      if (entry.userId.toString() === userId) {
        return { userId: entry.userId, count: 0 };
      }
      return entry;
    });
    await conversation.save();
    return conversation;
  }
}
