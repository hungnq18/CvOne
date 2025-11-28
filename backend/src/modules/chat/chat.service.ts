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
    private userService: UsersService
  ) {}

  async saveMessage(dto: SendMessageDto) {
    try {
      const conversationId = new Types.ObjectId(dto.conversationId);
      const senderId = new Types.ObjectId(dto.senderId);

      if (!conversationId || !senderId) {
        throw new Error("Invalid conversationId or senderId");
      }

      // 1️⃣ Tạo tin nhắn mới
      const message = await this.messageModel.create({
        conversationId,
        senderId,
        content: dto.content,
      });

      // 2️⃣ Tìm conversation
      const conversation = await this.convModel.findById(conversationId);
      if (!conversation) {
        throw new Error("Conversation not found");
      }

      // 3️⃣ Cập nhật lastMessage
      conversation.lastMessage = message._id as Types.ObjectId;

      // 4️⃣ Tăng unreadCount cho participant khác sender
      conversation.unreadCount = (conversation.unreadCount || []).map(
        (entry) => {
          if (entry.userId.toString() !== senderId.toString()) {
            return { ...entry, count: (entry.count || 0) + 1 };
          }
          return entry; // sender giữ nguyên
        }
      );

      // Không push thêm entry mới → luôn <=2 participant
      await conversation.save();

      // 5️⃣ Populate senderId trước khi trả về
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

    // Chỉ update participant hiện tại, không push thêm
    conversation.unreadCount = (conversation.unreadCount || []).map((entry) => {
      if (entry.userId.toString() === userId) {
        return { ...entry, count: 0 }; // reset count
      }
      return entry; // giữ nguyên participant còn lại
    });

    await conversation.save();
    return conversation;
  }
}
