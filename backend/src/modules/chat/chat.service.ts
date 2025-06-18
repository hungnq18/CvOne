import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Message } from "./schemas/message.schema";
import { Conversation } from "./schemas/conversation.schema";
import { SendMessageDto } from "./dto/send-message.dto";
import { ConversationService } from "../conversation/conversation.service";
import { UserDocument } from "../users/schemas/user.schema";
import { UsersService } from "../users/users.service";

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(Conversation.name) private convModel: Model<Conversation>,
    private userService: UsersService
  ) {}

  async saveMessage(dto: SendMessageDto) {
    const conversationId = new Types.ObjectId(dto.conversationId);
    const senderId = new Types.ObjectId(dto.senderId);
    const receiverId = new Types.ObjectId(dto.receiverId);
    if (!conversationId || !senderId || !receiverId) {
      throw new Error("Invalid conversationId or senderId or receiverId");
    }

    // 1. Tạo tin nhắn mới
    const message = await this.messageModel.create({
      ...dto,
      conversationId,
      senderId,
      receiverId,
    });

    // 2. Cập nhật conversation
    await this.convModel.findByIdAndUpdate(conversationId, {
      $set: {
        lastMessage: message._id,
        updatedAt: new Date(),
      },
      $inc: {
        unreadCount: 1,
      },
    });

    return message;
  }

  async getMessagesByConversationId(conversationId: string) {
    return this.messageModel
      .find({ conversationId: new Types.ObjectId(conversationId) })
      .sort({ createdAt: 1 }) // tăng dần theo thời gian
      .populate("senderId", "name") // nếu muốn lấy info người gửi
      .exec();
  }

  async getConversationDetail(conversationId: string, accountId: string) {
    const user: UserDocument =
      await this.userService.getUserByAccountId(accountId);

    if (!user || !user._id) {
      throw new Error("User not found or invalid user ID");
    }
    const lastMessage = await this.messageModel
      .findOne({ conversationId: new Types.ObjectId(conversationId) })
      .sort({ createdAt: -1 }) // message mới nhất
      .populate("senderId", "name") // nếu cần
      .lean();

    const unreadCount = await this.messageModel.countDocuments({
      conversationId: new Types.ObjectId(conversationId),
      readBy: { $ne: user._id },
      senderId: { $ne: user._id }, // chỉ đếm tin từ người kia
    });

    return {
      lastMessage,
      unreadCount,
    };
  }
}
