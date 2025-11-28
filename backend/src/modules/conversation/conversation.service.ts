import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Conversation } from "../chat/schemas/conversation.schema";
import { CreateConversationDto } from "./dto/create-conversation.dto";

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Conversation.name)
    private readonly convModel: Model<Conversation>,
  ) { }

  async createConversation(dto: CreateConversationDto) {
    const userIds = dto.participants.map((id) => new Types.ObjectId(id));

    // Kiểm tra xem đã tồn tại cuộc trò chuyện giữa 2 người này chưa
    const existing = await this.convModel.findOne({
      participants: { $all: userIds, $size: 2 },
    });

    if (existing) {
      return existing; // hoặc throw new ConflictException('Conversation already exists');
    }

    const conversation = new this.convModel({ participants: userIds });
    return conversation.save();
  }

  async getUserConversations(userId: string) {
    const conversations = await this.convModel
      .find({
        participants: new Types.ObjectId(userId),
      })
      .sort({ updatedAt: -1 })
      .populate([
        {
          path: "participants",
          select: "_id first_name last_name", // Thêm _id để frontend có thể lấy được
        },
        {
          path: "lastMessage",
          select: "content senderId createdAt",
          populate: {
            path: "senderId",
            select: "first_name last_name",
          },
        },
      ])
      .lean()
      .exec();

    // Normalize unreadCount format để frontend dễ xử lý
    // Frontend có thể nhận cả array {userId, count}[] hoặc number
    return conversations.map((conv) => ({
      ...conv,
      // Giữ nguyên array format để frontend xử lý được
      // Frontend code đã handle cả 2 cases: array và number
    }));
  }

  async getConversationDetail(conversationId: string, userId: string) {
    const userObjectId = new Types.ObjectId(userId);

    const conversation = await this.convModel
      .findById(conversationId)
      .populate([
        {
          path: "participants",
          select: "_id first_name last_name",
        },
        {
          path: "lastMessage",
          select: "content senderId createdAt",
          populate: {
            path: "senderId",
            select: "first_name last_name",
          },
        },
      ])
      .lean();

    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }

    // 🟡 Cập nhật unreadCount = 0 chỉ cho user hiện tại
    await this.convModel.updateOne(
      {
        _id: conversationId,
        "unreadCount.userId": userObjectId,
      },
      {
        $set: {
          "unreadCount.$.count": 0,
        },
      },
    );

    return {
      _id: conversation._id,
      participants: conversation.participants,
      lastMessage: conversation.lastMessage || null,
    };
  }
}
